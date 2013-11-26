$(document).ready(function() {


    function setColor(color, object) {
        switch(color) {
            case "primary":
            object.removeClass("success warning danger info");
            object.addClass("primary");
            break;
            case "success":
            object.removeClass("primary warning danger info");
            object.addClass("success");
            break;
            case "warning":
            object.removeClass("primary success danger info");
            object.addClass("warning");
            break;
            case "danger":
            object.removeClass("primary success warning info");
            object.addClass("danger");
            break;
            case "info":
            object.removeClass("primary success warning danger");
            object.addClass("info");
            break;
            default:
            console.log("Invalid Color");
            break;
        }
    }

    function renderData(data) {
        console.log("New Data");
        renderNumbers(data.numbers);
        renderShifts(data.shifts);
        renderMessages(data.messages);
        renderNews(data.news);
        renderTalks(data.talks);
    }

    function renderNumbers(numberData) {
        //Get the DOM Objects
        var upcoming = $(".forecast > .upcoming-shifts > .number");
        var night = $(".forecast > .upcoming-night-shifts > .number");
        var current = $(".forecast > .currently-working > .number");
        var worked = $(".forecast > .hours-worked > .number");

        //Set the Numbers
        upcoming.html(numberData.angelsNeeded);
        night.html(numberData.nightAngelsNeeded);
        current.html(numberData.currentlyWorking);
        worked.html(numberData.hoursWorked);

        //Set the Colors
        if (numberData.angelsNeeded > 9) {
            setColor("danger", upcoming);
        }
        else if (numberData.angelsNeeded > 0) {
            setColor("warning", upcoming);
        }
        else {
            setColor("success", upcoming);
        }

        if (numberData.nightAngelsNeeded > 9) {
            setColor("danger", night);
        }
        else if (numberData.nightAngelsNeeded > 0) {
            setColor("warning", night);
        }
        else {
            setColor("success", night);
        }
    }

    function renderShifts(shiftData) {
        var nowShifts = shiftData.filter(function(item) {
            var now = new Date();
            var start = new Date(item.start * 1000);
            console.log((start - now) / 1000 / 60 / 60 / 24);
            //return (start - now) > 0 && (start - now < (1000 * 60 * 60) );
            return true;
        });

        var soonShifts = shiftData.filter(function(item) {
            var now = new Date();
            var start = new Date(item.start * 1000);
            console.log((start - now) / 1000 / 60 / 60 / 24);
            //return (start - now) > (1000 * 60 * 60 * 2) && (start - now < (1000 * 60 * 60) );
            return true;
        });

        var nowShiftContainer = $(".job-list > .jobs-now");
        var soonShiftContainer = $(".job-list > .jobs-soon");

        nowShiftContainer.empty();
        $.each(nowShifts, function(i,shift) {
            var showIt = false;
            var article = $("<article>");
            article.addClass("job well");
            var header = $("<header>");
            var headerParagraph = $("<p>");
            $.each(shift.angeltypes, function(i, angeltype) {
                var needed = angeltype.count - angeltype.taken;
                if (needed > 0) {
                    showIt = true;
                    headerParagraph.append(needed + " " + angeltype.name);
                }
            });

            header.append(headerParagraph);
            article.append(header);
            nowShiftContainer.append(article);

        });

        soonShiftContainer.empty();
        $.each(soonShifts, function(i,shift) {
        });
    }

    /*
    <article class="job well warning">
          <header>
            <p>1<i class="icon-audio"></i> 2<i class="icon-video"></i><time class="icon-clock">16:00&ndash;17:30</time> <span class="location icon-location">Saal 1</span></p>
          </header>
          <p class="job-description">Cryptology in quantum computing</p>
        </article>
     */

    function renderMessages(messageData) {

    }

    function renderNews(newsData) {

    }

    function renderTalks(talkData) {

    }



    var socket = io.connect('http://localhost:3000');

    socket.on('dataUpdate', function(data) {
        renderData(data);
    });
});
    // var listContainer = $("#jobList");
    // listContainer.empty();
    // $.each(jobList, function(i,v) {

    //   var div = $('<div>').addClass("col-md-3");
    //   var well = $('<div>').addClass("well");
    //   well.append($('<h4>').html(v.Title));
    //   well.append($('<p>').html(v.Start));
    //   well.append($('<p>').html(v.End));
    //   well.append($('<p>').html(v.Location));
    //   div.append(well);
    //   listContainer.append(div);
    // });