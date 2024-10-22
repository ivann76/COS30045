   // Define the dimensions of the SVG
   const width = 300;
   const height = 300;
   const radius = Math.min(width, height) / 2;

   // Create a color scale
   const color = d3.scaleOrdinal(d3.schemeCategory10);

   // Define the data
   const data = [10, 20, 30, 40, 50];

   // Create the pie generator
   const pie = d3.pie();

   // Create the arc generator
   const arc = d3.arc()
       .outerRadius(radius - 10)
       .innerRadius(0);  // Set to greater than 0 for donut chart

   // Create an SVG container
   const svg = d3.select("#chart")
       .attr("width", width)
       .attr("height", height)
       .append("g")
       .attr("transform", `translate(${width / 2}, ${height / 2})`);

   // Bind the data and create one path per pie slice
   const g = svg.selectAll(".arc")
       .data(pie(data))
       .enter().append("g")
       .attr("class", "arc");

   g.append("path")
       .attr("d", arc)
       .style("fill", (d, i) => color(i));

   // Add text labels to the slices
   g.append("text")
       .attr("transform", d => `translate(${arc.centroid(d)})`)
       .attr("dy", ".35em")
       .text(d => d.data);