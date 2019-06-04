const json = {
    "io1": {
        name: "Input 1",
        data: "1"
    },
    "io2": {
        name : "Input 2",
        data : "2"
    },
    "vision1": {
        name : "vision 1",
        data : "a"
    },
    "vision2": {
        name : "vision 2",
        data : "b"
    },
    "teste": {
        name : "Teste",
        data : "testinho"
    }
}

let connections ={
    
}

let Draggable = {
    drag_selected: null,
    draggables: [],
    lineId: 1,
    line_selected: null,
    x1: null,
    y1: null,
    x2: null,
    y2: null,
    init: function(){
        this.events();
        this.addDraggable();
    },
    addDraggable: function(){
        $(".draggable").draggable({
            // revert: true,
            scroll: false,
            opacity: 0.35,
            revertDuration: 100,
            drag: function(e, ui) {
                let dist_click = e.pageX - $(this).offset().left;
                if((dist_click < 20 || dist_click > 80) && (!$(this).hasClass("ui-draggable-dragging") || $(this).hasClass("ui-draggable-disabled")))
                    return false;
    
                let max_left_drag = $('#drag_body').width() - ui.helper.width(),
                    max_top_drag = $('#drag_body').height() - ui.helper.height();
                
                ui.position.left = (ui.position.left < 0)? 0 : Math.min(ui.position.left, max_left_drag);
                ui.position.top = (ui.position.top < 0)? 0 : Math.min(ui.position.top, max_top_drag);

                let x = $(this).offset().left - $(".sidenav").width(),
                    y = $(this).offset().top + $(this).height()/2;

                if($(this)[0].hasAttribute("data-output")){
                    // loop pelos data output
                    $(".line_"+$(this).attr("data-output")).attr("x1", x + $(this).width())
                    $(".line_"+$(this).attr("data-output")).attr("y1", y)
                }

                if($(this)[0].hasAttribute("data-input")){
                    // loop pelos data output
                    $(".line_"+$(this).attr("data-input")).attr("x2", x)
                    $(".line_"+$(this).attr("data-input")).attr("y2", y)
                }

            }
        });
    },
    removeDraggable: function(){},

    addSVG: function(e, clear = true){
        let x2 = $(e).offset().left - $(".sidenav").width(),
            y2 = $(e).offset().top + $(e).height()/2
            line = makeSVG('line', {x1: this.x1, y1: this.y1, x2:x2, y2:y2, stroke: 'black', 'stroke-width': 2, 'class': "line_"+this.lineId});

        $("svg").append(line);
        $("svg").append(makeSVG('line', {x1: this.x1, y1: this.y1, x2:x2, y2:y2, stroke: 'black', 'stroke-width': 2, 'class': "arrow_"+this.lineId}))
        $("svg").append(makeSVG('line', {x1: this.x1, y1: this.y1, x2:x2, y2:y2, stroke: 'black', 'stroke-width': 2, 'class': "arrow2_"+this.lineId}));
        
        this.lineId ++;
        if(clear)
            this.x1 = this.y1 = null;
    },
    events: function(){
        const self = this;

        $(".draggable").on("mousedown", function(e){
            let dist_click = e.pageX - $(this).offset().left;
    
            if(dist_click < 20 || dist_click > 80){
                $(this).draggable("disable");
            }
    
            self.drag_selected = $(this);
        });
    
        $("html, .draggable").on("mouseup", function(e){
            if(self.drag_selected){
                if($(this).is('.draggable') && !$(this).is(self.drag_selected)){
                    $(this).attr("data-input", self.lineId);
                    self.drag_selected.attr("data-output", self.lineId);
                    self.addSVG(this);
                    $(".line_"+self.line_selected).remove();

                    self.x1 = self.y1 = null;
                } else {
                    self.drag_selected.draggable("enable");
                    self.drag_selected = self.x1 = self.y1 = null;

                    $(".line_"+self.line_selected).remove();
                }
                self.drag_selected = null;
                self.line_selected = null;
            }
        });
    
        $(".draggable").on("mouseleave", function(e){
            if(!self.drag_selected || self.drag_selected.hasClass("ui-draggable-dragging"))
                return false;

            self.x1 = self.drag_selected.offset().left - $(".sidenav").width() + self.drag_selected.width();
            self.y1 = self.drag_selected.offset().top + self.drag_selected.height()/2;
        });

        $("html").on("mousemove", function(e){
            if(self.x1 && self.y1){
                self.x2 = (e.clientX || e.pageX) - $(".sidenav").width();
                self.y2 = e.clientY || e.pageY //menos tamanho do nav

                if(!self.line_selected){
                    self.line_selected = self.lineId;
                    self.addSVG(this, false);
                }

                let theta = Math.atan2(self.y1 - self.y2, self.x1 - self.x2),
                    x = 10 * Math.cos(theta - 0.785398),
                    y = 10 * Math.sin(theta - 0.785398);
                    
                $(".line_"+self.line_selected).attr({
                    "x2": self.x2,
                    "y2": self.y2
                })

                $(".arrow_"+self.line_selected).attr({
                    "x1": self.x2 + x,
                    "y1": self.y2 + y,
                    "x2": self.x2,
                    "y2": self.y2
                })

                $(".arrow2_"+self.line_selected).attr({
                    "x1": self.x2 - y,
                    "y1": self.y2 + x,
                    "x2": self.x2,
                    "y2": self.y2
                })
            }
        });
    }
}

let Tela = {
    init: function(){
        for (element in json) {
            let html = "<div class='element_item' value='"+json[element].data+"'><p>"+json[element].name+"</p></div>";
            $('#element_list').append(html);
        }
    }
}

$(function(){
    Draggable.init();
    Tela.init();   
})

function makeSVG(tag, attrs) {
    var el = document.createElementNS('http://www.w3.org/2000/svg', tag);
    for (var k in attrs)
        el.setAttribute(k, attrs[k]);
    return el;
}

// Criar objeto connection
// Criar objeto Drag Drop{
//     drag_zindex: 10,
//     listagem: function(){},
//     setDraggable: function(){},
//     setConnection: function()}{}
// }