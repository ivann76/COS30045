 // Set the dimensions of the SVG canvas
 const width = 300;
 const height = 300;
 const margin = { top: 20, right: 20, bottom: 30, left: 40 };

 // Set up the data
 const dataset = [
     { apples: 5, oranges: 10, grapes: 22 },
     { apples: 4, oranges: 12, grapes: 28 },
     { apples: 2, oranges: 19, grapes: 32 },
     { apples: 7, oranges: 23, grapes: 35 },
     { apples: 23, oranges: 17, grapes: 43 }
 ];

 const keys = ["apples", "oranges", "grapes"];  // Define the categories

 // Set up the stack generator
 const stack = d3.stack()
     .keys(keys);

 const series = stack(dataset);  // This will return the stacked series array

 // Set up the scales
 const xScale = d3.scaleBand()
     .domain(d3.range(dataset.length))
     .range([margin.left, width - margin.right])
     .padding(0.1);

 const yScale = d3.scaleLinear()
     .domain([0, d3.max(series, d => d3.max(d, d => d[1]))])
     .range([height - margin.bottom, margin.top]);

 // Set up color scale
 const color = d3.scaleOrdinal(d3.schemeCategory10);

 // Create the SVG container for the bar chart
 const svg = d3.select("#chart")
     .attr("width", width)
     .attr("height", height);

 // Create a group for each stack and add rectangles
 svg.selectAll("g")
     .data(series)
     .enter().append("g")
     .attr("fill", (d, i) => color(i))
     .selectAll("rect")
     .data(d => d)
     .enter().append("rect")
     .attr("x", (d, i) => xScale(i))
     .attr("y", d => yScale(d[1]))
     .attr("height", d => yScale(d[0]) - yScale(d[1]))
     .attr("width", xScale.bandwidth());

 // Add the X Axis
 svg.append("g")
     .attr("transform", `translate(0, ${height - margin.bottom})`)
     .call(d3.axisBottom(xScale).tickFormat(i => i + 1));  // Replace with your desired label

 // Add the Y Axis
 svg.append("g")
     .attr("transform", `translate(${margin.left}, 0)`)
     .call(d3.axisLeft(yScale));

 // Create a legend for the stacked bar chart
 const legend = d3.select("#legend")
     .attr("width", width)
     .attr("height", 50);

 const legendGroup = legend.selectAll("g")
     .data(keys)
     .enter().append("g")
     .attr("transform", (d, i) => `translate(${i * 100}, 10)`);  // Position each legend item

 // Append rectangles to the legend
 legendGroup.append("rect")
     .attr("width", 15)
     .attr("height", 15)
     .attr("fill", (d, i) => color(i));

 // Append text labels to the legend
 legendGroup.append("text")
     .attr("x", 20)
     .attr("y", 12)
     .attr("dy", "0.35em")
     .text(d => d);