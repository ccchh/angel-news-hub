// $(document).ready(function() {

//   function renderJobs(jobList) {
//     var listContainer = $("#jobList");
//     listContainer.empty();
//     $.each(jobList, function(i,v) {

//       var div = $('<div>').addClass("col-md-3");
//       var well = $('<div>').addClass("well");
//       well.append($('<h4>').html(v.Title));
//       well.append($('<p>').html(v.Start));
//       well.append($('<p>').html(v.End));
//       well.append($('<p>').html(v.Location));
//       div.append(well);
//       listContainer.append(div);
//     });
//   }

//   var socket = io.connect('http://localhost:3000');

//   socket.on('dataUpdate', function(data) {
//     renderJobs(data.jobList);
//   });
// });