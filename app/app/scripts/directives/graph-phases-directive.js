angular.module('cupcakeDashboard')
  .directive("graphPhaseDistribution", function($http) {
    // constants
     var margin = {left: 15, right: 15, top: 10, bottom: 20},
       width = 320,
       height = 90,
       color = d3.interpolateRgb("#f77", "#77f");

     return {
       restrict: 'A',
       // scope: {
       //  projects: '='
       // },
       link: function (scope, element, attrs) {

        $http.get("/api/phases").then(function(res){
          scope.data = res.data;
        });

         // set up initial svg object
         var vis = d3.select(element[0])
           .append("svg")
             .attr("width", width + margin.left + margin.right)
             .attr("height", height + margin.top + margin.bottom)
             .attr("viewBox", "0 0 " + (width + margin.left + margin.right) + " " + (height + margin.top + margin.bottom))
               .append('g')
               .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');


         scope.$watch('data', function (newVal, oldVal) {

           // if 'val' is undefined, exit
           if (!newVal) {
             return;
           }

           if (!scope.data){
            return;
           }

           // var projectIds = _.pluck(scope.projects, '_id' );

           // data = _.filter(data, function(e){
           //   return _.contains(projectIds, e.model._id)
           // });

           var maxY = _.max(scope.data, function(d){
             return d.count;
           }).count;

           var maxX = _.max(scope.data, function(d){
             return d.phase;
           }).phase;

           var x = d3.scale.ordinal().domain(scope.data.map(function (d) {return d.title; })).rangeRoundBands([margin.left, width], 0.05);
           var y = d3.scale.linear().domain([0, maxY]).range([0, height]).clamp(true);
           var color = d3.scale.linear().domain([0, maxX]).range(['#00D4F0','#E80275']).clamp(true);

           var xAxis = d3.svg.axis().scale(x).orient("bottom");

           function bars() {
              vis.selectAll('*').remove();
              vis.selectAll('svg')
               .data(scope.data)
               .enter()
                 .append("rect")
                 .transition()
                 .duration(100)
                 .attr("y", function(d) { return height; })
                 .attr("x", function(d) { return x(d.title); })
                 .attr("width", function(d) { return width / scope.data.length - 10; })
                 .attr("height", function(d){ return 0; })
                 .text(function(d){ return d.count; })
                 .each("end", transitionEnd);

                 vis.append("g")
                     .attr("class", "axis")
                     .attr('transform', 'translate(0,' + height + ')')
                     .call(xAxis);

                vis.selectAll("svg")
                  .append("g")
                  .data(scope.data)
                  .enter()
                  .append("text")
                  .attr("x", function(d){
                    return x(d.title) + ((width/scope.data.length - 10)/2);
                  })
                  .attr("y", function(d){
                    return (height - y(d.count)) + 12;
                  })
                  .attr("font-size", "11px")
                  .attr("fill", "#FFF")
                  .style("text-anchor", "middle")
                  .text(function(d){if(d.count != 0){return d.count;} else { return '';} });

                function transitionEnd(){
                 d3.select(this)
                  .transition()
                  .duration(500)
                  .ease("elastic")
                  .attr("fill", function(d) { return color(d.phase); })
                  .attr("y", function(d) { return (height) - y(d.count); })
                  .attr("height", function(d){ return y(d.count) });
                }
           }

           bars();

         });
      }
    }
});