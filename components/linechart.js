class LineChart {
    margin = {
        top: 50, right: 150, bottom: 100, left: 100
    }

    constructor(svg, tooltip, width = 450, height = 400) {
        this.svg = svg;
        this.tooltip = tooltip;
        this.width = width;
        this.height = height;
    }

    initialize() {
        this.svg = d3.select(this.svg);
        this.container = this.svg.append("g");
        this.tooltip = d3.select(this.tooltip);
        this.xAxis = this.svg.append("g");
        this.yAxis = this.svg.append("g");
        this.legend = this.svg.append("g");
        this.line = d3.line();

        this.xScale = d3.scaleLinear();
        this.yScale = d3.scaleLinear();

        this.svg
            .attr("width", this.width + this.margin.left + this.margin.right)
            .attr("height", this.height + this.margin.top + this.margin.bottom);

        this.container.attr("transform", `translate(${this.margin.left}, ${this.margin.top})`);

    }

    update(data, selected_names) {
        //if(del_name.length !== 0){
        d3.selectAll("." + 'prev').transition().style("opacity", 0)
        //}
        
        console.log('here')
        const years = [...new Set(data.filter(d => selected_names.indexOf(d['winner_name']) !== -1 || selected_names.indexOf(d['loser_name']) !== -1)
                                        .map(d => (d["tourney_date"].slice(0,4))*1))];
        

        let rate_data = []
        years.forEach(e => {
            let one_d = {time:e}
            selected_names.forEach(name =>{
                let win_count = data.filter(d=> d["tourney_date"].slice(0,4)*1 === e && d['winner_name'] === name).length
                let lose_count = data.filter(d=> d["tourney_date"].slice(0,4)*1 === e && d['loser_name'] === name).length
                if( lose_count + win_count === 0){
                    one_d[name] = 0
                }
                else{
                    one_d[name] = (win_count / (lose_count + win_count)) * 100
                    one_d[name+'_win'] = win_count
                    one_d[name+'_lose'] = lose_count
                }
            })

            rate_data.push(one_d)
        });

        console.log(rate_data)
        const dataReady = selected_names.map( function(grpName) { // .map allows to do something for each element of the list
            return {
                name: grpName,
                values: rate_data.map(function(d) {
                    return {time: d.time, value: d[grpName]};
                    }),

                values_for_tip: rate_data.map(function(d) {
                return {time: d.time, value: d[grpName], win: d[grpName+'_win'], lose: d[grpName+'_lose']};
                })
            };
        });
        console.log(dataReady)

        const myColor = d3.scaleOrdinal()
            .domain(selected_names)
            .range(d3.schemeCategory10);

        this.xScale = d3.scaleLinear()
            .domain([Math.min(...years), Math.max(...years)])
            .range([ 0, this.width ]);


        const xAxisTicks = this.xScale.ticks()
            .filter(tick => Number.isInteger(tick));
        this.xAxis
            .attr("transform", `translate(${this.margin.left}, ${this.margin.top + this.height})`)
            .transition()
            .call(d3.axisBottom(this.xScale).tickValues(xAxisTicks)
            .tickFormat(d3.format('d')));
        
        this.yScale = d3.scaleLinear()
            .domain( [0,100])
            .range([ this.height, 0 ]);
        
    
        this.yAxis
            .attr("transform", `translate(${this.margin.left}, ${this.margin.top})`)
            .transition()

            .call(d3.axisLeft(this.yScale));

        if (data.length === 0){
            return;
        }
        // Add the lines
        this.line = d3.line()
            .x(d => this.xScale(+d.time))
            .y(d => this.yScale(+d.value))

        this.container.selectAll("myLines")
            .data(dataReady)
            .join("path")
            .attr("class", 'prev')
            .attr("d", d => this.line(d.values))
            .attr("stroke", d => myColor(d.name))
            .style("stroke-width", 5)
            .style("fill", "none")

        //Add the points
        this.circles = this.container
        // First we need to enter in a group
        .selectAll("myDots")
        .data(dataReady)
        .join('g')
            .style("fill", d => myColor(d.name))
            .attr("class", 'prev')
        // Second we need to enter in the 'values' part of this group
        .selectAll("circle")
        .data(d => d.values_for_tip)
        .join("circle")
        .on("mouseover", (e, d) => {
            this.tooltip.select(".tooltip-inner")
                .html(`win: ${d.win} <br />lose: ${d.lose}`);

            Popper.createPopper(e.target, this.tooltip.node(), {
                placement: 'top',
                modifiers: [
                    {
                        name: 'arrow',
                        options: {
                            element: this.tooltip.select(".tooltip-arrow").node(),
                        },
                    },
                ],
            });

            this.tooltip.style("display", "block");
        })
        .on("mouseout", (d) => {
            this.tooltip.style("display", "none");
        });

        
        this.circles
            .transition()
            .attr("cx", d => this.xScale(d.time))
            .attr("cy", d => this.yScale(d.value))
            .attr("r", 5)
            .attr("stroke", "white")


        /*
        this.container
        // First we need to enter in a group
        .selectAll("myDots")
        .data(dataReady)
        .join('g')
            .style("fill", d => myColor(d.name))
            .attr("class", 'prev')
        // Second we need to enter in the 'values' part of this group
        .selectAll("circle")
        .data(d => d.values)
        .join("circle")
            .transition()
            .attr("cx", d => this.xScale(d.time))
            .attr("cy", d => this.yScale(d.value))
            .attr("r", 5)
            .attr("stroke", "white")
        */
        // Add a legend at the end of each line
        this.container
        .selectAll("myLabels")
        .data(dataReady)
        .join('g')
            .append("text")
            .datum(d => { return {name: d.name, value: d.values[d.values.length - 1]}; }) // keep only the last value of each time series
            .attr("transform",d => `translate(${this.xScale(d.value.time)},${this.yScale(d.value.value)})`) // Put the text at the position of the last point
            .attr("x", 12) // shift the text a bit more right
            .text(d => d.name)
            .style("fill", d => myColor(d.name))
            .style("font-size", 15)
            .attr("class", 'prev')
        
        this.legend
            .style("display", "inline")
            .style("font-size", ".8em")
            .attr("transform", `translate(${this.width/2+10}, ${this.height+70})`)
            .call(d3.legendColor().scale(myColor))
        
    }
}