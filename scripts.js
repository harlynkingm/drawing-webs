function point(x, y, size){
    this.x = x;
    this.y = y;
    this.size = size;
    this.twin = null;
}

function line(p1, p2){
    this.p1 = p1;
    this.p2 = p2;
}

$(document).ready(function () {
    var canvas = document.getElementById('main');
    var TOP = canvas.offsetTop;
    canvas.width = $(window).width();
    canvas.height = $(window).height() - TOP;
    var context = canvas.getContext('2d');
    context.strokeStyle = "#333333";
    context.lineCap = 'round';
    context.lineJoin = 'round';
    context.lineWidth = 5;
    var points = new Array();
    var lines = new Array();
    var mirrored = true;
    var editpoint = null;
    var origMousePos = null;
    
    function refresh(){
        clear();
        canvas.width = $(window).width();
        canvas.height = $(window).height() - TOP;
        if (mirrored){
            context.beginPath();
            context.moveTo(canvas.width/2, 0);
            context.lineTo(canvas.width/2, canvas.height);
            context.stroke();
            context.closePath();
        }
        for (i = 0; i < points.length; i++){
            drawPoint(points[i]);
        }
        for (i = 0; i < lines.length; i++){
            drawLine(lines[i]);
        }
    }
    
    function drawLine(line){
        context.beginPath();
        context.moveTo(line.p1.x, line.p1.y);
        context.lineTo(line.p2.x, line.p2.y);
        context.stroke();
        context.closePath();
    }
    
    function drawPoint(point){
        context.beginPath();
        context.fillStyle = '#333';
        context.arc(point.x, point.y, point.size, 0, Math.PI*2, true);
        context.fill();
        context.stroke();
        context.closePath();
    }
    
    function startover(){
        points = new Array();
        lines = new Array();
        refresh();
    }
    
    function clear(){
        context.clearRect(0, 0, canvas.width, canvas.height);
    }
    
    function distance(p1, p2){
        x1 = p1.x;
        x2 = p2.x;
        y1 = p1.y;
        y2 = p2.y;
        var d = Math.sqrt( (x1-x2)*(x1-x2) + (y1-y2)*(y1-y2) );
        return d;
    }
    
    function addClosestLines(point){
        var closest = findClosest(point);
        for (i = 0; i < closest.length; i++){
            var newLine = new line(point, closest[i]);
            lines.push(newLine);
        }
    }
    
    function findClosest(point){
        var distances = new Array();
        for (i = 0; i < points.length; i++){
            distances.push(distance(point, points[i]));
        }
        var first = 10000;
        var second = 10000;
        var firstIndex = 0;
        var secondIndex = 1;
        for (i = 0; i < distances.length; i++){
            if (distances[i] > 0 && distances[i] < first){
                second = first;
                secondIndex = firstIndex;
                first = distances[i];
                firstIndex = i;
            }
            else if (distances[i] > 0 && distances[i] < second && distances[i] != first){
                second = distances[i];
                secondIndex = i;
            }
        }
        return [points[firstIndex], points[secondIndex]];
    }
    
    canvas.addEventListener("mousedown", function(event){
        var mousePoint = new point(event.clientX, event.clientY - TOP);
        var add = true;
        for (i = 0; i < points.length; i++){
            if (distance(mousePoint, points[i]) < 5){
                add = false;
                editpoint = points[i];
                origMousePos = mousePoint;
            }
        }
        if (add){
            newPoint(event);
            origMousePos = mousePoint;
        }
        refresh();
    });
    
    canvas.addEventListener("touchstart", function(event){
        var touchPoint = new point(event.touches[0].clientX, event.touches[0].clientY - TOP);
        var add = true;
        for (i = 0; i < points.length; i++){
            if (distance(touchPoint, points[i]) < 5){
                add = false;
                editpoint = points[i];
                origMousePos = touchPoint;
            }
        }
        if (add){
            newPoint(event);
            origMousePos = touchPoint;
        }
        refresh();
    });
    
    canvas.addEventListener("mousemove", function(event){
        if (editpoint != null){
            var mousePoint = new point(event.clientX, event.clientY - TOP);
            editpoint.x += (mousePoint.x - origMousePos.x);
            editpoint.y += (mousePoint.y - origMousePos.y);
            if (editpoint.twin != null){
                editpoint.twin.x -= (mousePoint.x - origMousePos.x);
                editpoint.twin.y += (mousePoint.y - origMousePos.y);
            }
            origMousePos = mousePoint;
            refresh();
        }
    });
    
    canvas.addEventListener("touchmove", function(event){
        event.preventDefault();
        if (editpoint != null){
            var mousePoint = new point(event.touches[0].clientX, event.touches[0].clientY - TOP);
            editpoint.x += (mousePoint.x - origMousePos.x);
            editpoint.y += (mousePoint.y - origMousePos.y);
            if (editpoint.twin != null){
                editpoint.twin.x -= (mousePoint.x - origMousePos.x);
                editpoint.twin.y += (mousePoint.y - origMousePos.y);
            }
            origMousePos = mousePoint;
            refresh();
        }
    });
    
    canvas.addEventListener("mouseup", function(event){
        if (editpoint != null){
            editpoint = null;
            origMousePos = null;
        }
    });
    
    canvas.addEventListener("touchend", function(event){
        if (editpoint != null){
            editpoint = null;
            origMousePos = null;
        }
    });
    
    function newPoint(event){
        var centerX = canvas.width/2;
        var distX = Math.abs(event.clientX - centerX);
        var valY = event.clientY - TOP;
        var newPoint = new point(event.clientX, valY, 2);
        points.push(newPoint);
        if (mirrored){
            if (event.clientX > centerX){
                var point2 = new point(centerX - distX, valY, 2);
                point2.twin = newPoint;
                points.push(point2);
            }
            else{
                var point2 = new point(centerX + distX, valY, 2);
                point2.twin = newPoint;
                points.push(point2);
            }
            newPoint.twin = point2;
        }
        if (points.length >= 2){
            addClosestLines(newPoint);
            if (mirrored){
                addClosestLines(point2);
            }
        }
        editpoint = newPoint;
    }
    
    window.addEventListener('resize', function(){
        refresh();
    });
    
    refresh();
    
    function toggleLine(){
        if (mirrored){
            mirrored = false;
            document.getElementById('mirroring').innerHTML = 'Mirrored: OFF';
        }
        else{
            mirrored = true;
            document.getElementById('mirroring').innerHTML = 'Mirrored: ON';
        }
        refresh();
    }
    
    document.getElementById('mirroring').onclick = toggleLine;
    document.getElementById('clear').onclick = startover;
    
    function downloadCanvas(){
        var link = document.getElementById('download');
        link.href = document.getElementById('main').toDataURL();
        link.download = 'drawing.png';
    }
    
    document.getElementById('download').addEventListener('click', function(){
        if (mirrored){
            var wasmirrored = true;
            mirrored = false;
            refresh();
        }
        downloadCanvas();
        if (wasmirrored){
            mirrored = true;
            refresh();
        }
    }, false);
});