$(document).ready(function() {
  function zeroFill(number) {
   if(number === 0) {
     return '00';
   }
   else if(number<10) {
     number = number.toString();
     return '0' + number;
   }
	return number + ''; // always return a string
}

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

  var nowShiftContainer = $(".job-list > .jobs-now");
  var soonShiftContainer = $(".job-list > .jobs-soon");

  nowShiftContainer.empty();
  $.each(shiftData.nowShifts, function(i,shift) {
    nowShiftContainer.append(generateShiftDOM(shift));
  });
  soonShiftContainer.empty();
  $.each(shiftData.soonShifts, function(i, shift) {
   soonShiftContainer.append(generateShiftDOM(shift));
 });
}

function generateShiftDOM(shift) {
  var article = $("<article>");
  article.addClass("job well");
  var header = $("<header>");
  var headerParagraph = $("<p>");
  $.each(shift.angelsNeeded, function(i, angel) {
   if (angel.count > 0) {
    headerParagraph.append(angel.count);
    headerParagraph.append($("<i>").addClass("icon-" + angel.angeltype));
  }
});

  var start = new Date(shift.start);
  var end = new Date(shift.end);

  var time = $('<time>').addClass("icon-clock");

  time.append(zeroFill(start.getHours()) + ":");
  time.append(zeroFill(start.getMinutes()));
  time.append("&ndash;");
  time.append(end.getHours() + ":" + end.getHours());

  headerParagraph.append(time);

  var location = $('<span>').addClass('location icon-location');
  location.append(shift.location);
  headerParagraph.append(location);

  header.append(headerParagraph);
  article.append(header);

  var description = $('<p>').addClass('job-description');
  description.append(shift.title);
  article.append(description);

  if (shift.totalAngelsNeeded > 4) {
    setColor("danger", article);
  } else if (shift.totalAngelsNeeded > 1) {
    setColor("warning", article);
  }

  return article;
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
