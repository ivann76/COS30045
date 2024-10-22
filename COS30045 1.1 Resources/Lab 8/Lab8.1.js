        // Define the dimensions of the SVG
        const width = 600;
        const height = 600;

        // Select the actual SVG element by ID, not the body
        const svg = d3.select("#map")
            .attr("width", width)
            .attr("height", height);

        // Define a projection (Mercator) and center it on Victoria, Australia
        const projection = d3.geoMercator()
            .center([145, -37])  // Center on Victoria (longitude, latitude)
            .translate([width / 2, height / 2])  // Center the map within the SVG
            .scale(3000);  // Scale for zoom

        // Define a path generator using the projection
        const path = d3.geoPath().projection(projection);

        // Load the GeoJSON data for Victoria's LGAs
        d3.json("LGA_VIC.json").then(function(json) {
            // Bind data and create one path per GeoJSON feature
            svg.selectAll("path")
                .data(json.features)
                .enter()
                .append("path")  // Append path elements
                .attr("class", "lga-boundary")
                .attr("d", path);  // Use the path generator to create the "d" attribute

        }).catch(function(error) {
            console.log("Error loading the GeoJSON file:", error);
        });