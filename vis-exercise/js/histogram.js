
class Histogram {

    constructor(width, height){
        this.width = width;
        this.height = height;
        this.marginTop = 20;
        this.marginRight = 20;
        this.marginLeft = 40;
        this.marginBottom = 30;
        this.data = null;
        this.bins = null;
        this.svgElem = null;
        this.xScale = null;
        this.yScale = null;
        this.binGenerator = d3.bin()
            .thresholds(100)
            .value((d) => d);
    }

    createChart() {
        
        this.data = [0.0];
        this.bins = this.binGenerator(this.data);

        // Declare the x (horizontal position) scale.
        this.xScale = d3.scaleLinear()
            .domain([0.0, 1])
            .range([this.marginLeft, this.width - this.marginRight]);

        // Declare the y (vertical position) scale.
        this.yScale = d3.scaleSymlog()
            .domain([0.0, 1.0])
            .range([this.height - this.marginBottom, this.marginTop]).constant(0.01);
        
        this.yScaleDisplay = d3.scaleSymlog()
            .domain([0.0, 1.0])
            .range([this.height - this.marginBottom, this.marginTop]);

        // Create the SVG container.
        this.svgElem = d3.create("svg")
            .attr("width", this.width)
            .attr("height", this.height * 2);

        // Add the x-axis.
        this.svgElem.append("g")
            .attr("id", "xAxis")
            .attr("transform", `translate(0,${this.height - this.marginBottom})`)
            .call(d3.axisBottom(this.xScale))
            .call((g) => g.append("text")
            .attr("x", this.width)
            .attr("y", this.marginBottom - 4)
            .attr("fill", "currentColor")
            .attr("text-anchor", "end")
            .text(" Density →"));

        // Add the y-axis.
        this.svgElem.append("g")
            .attr("id", "yAxis")
            .attr("transform", `translate(${this.marginLeft},0)`)
            .call(d3.axisLeft(this.yScale))
            .call((g) => g.append("text")
            .attr("x", -1 * this.marginLeft)
            .attr("y", 10)
            .attr("fill", "currentColor")
            .attr("text-anchor", "start")
            .text("↑ Intensity "));

        
        // create bars
        this._appendBars();

        // Return the SVG element.
        return this.svgElem.node();
    }

    //remove the current bars
    _removeBars(){
        const currentRects = d3.select("#bars");
        currentRects.remove();
        
    }

    //appends new bars based on the current bins
    _appendBars(){
        console.log(this.bins);
        let maxLen = 0;
        for (let idx = 0; idx < this.bins.length; idx++) {
            if(maxLen < this.bins[idx].length){
                maxLen = this.bins[idx].length
            }
            
        }

        this.svgElem.append("g")
            .attr("id", "bars")
            .attr("fill", "white")
            .attr("fill-opacity", "0.3")
            .selectAll()
            .data(this.bins)
            .join("rect")
            .attr("x", (d) => this.xScale(d.x0) + 1)
            .attr("width", (d) => this.xScale(d.x1) - this.xScale(d.x0) - 3)
            .attr("y", (d) =>  this.yScale(0.0))
            .attr("height", (d) => 0)
            .transition()
            .duration(500)
            .ease(d3.easePolyIn)
            .attr("y", (d) =>  this.yScale(0.0))
            .attr("height", (d) => this.yScale(0.0) - this.yScale(d.length/maxLen));
    }

    //replaces the currently displayed Data with a new
    //dataset
    replaceData(newData){

        this.data = newData;
        this.bins = this.binGenerator(this.data);

        this._removeBars();
        this._appendBars();
    }
}