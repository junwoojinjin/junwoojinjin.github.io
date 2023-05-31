class stackBar {
    margin = {
        top: 50, right: 10, bottom: 40, left: 40
    }

    constructor(svg, tooltip, width = 450, height = 400) {
        this.svg = svg;
        this.width = width;
        this.height = height;
        this.tooltip = tooltip;
    }

    initialize() {
        this.svg = d3.select(this.svg);
        this.container = this.svg.append("g");
        this.bars = this.svg.append("g");
        this.tooltip = d3.select(this.tooltip);
        this.xAxis = this.svg.append("g");
        this.yAxis = this.svg.append("g");
        this.legend = this.svg.append("g");

        this.xScale = d3.scaleBand();
        this.yScale = d3.scaleLinear();

        this.svg
            .attr("width", this.width + this.margin.left + this.margin.right)
            .attr("height", this.height + this.margin.top + this.margin.bottom);

        this.container.attr("transform", `translate(${this.margin.left}, ${this.margin.top})`);

    }

    update(data, selected_names, is_matched) {
        console.log('stack');
        if(data.length === 0){
            d3.selectAll("." + 'prev_stack').transition().style("opacity", 0)
        }
        else{
            d3.selectAll("." + 'prev_stack').transition().style("opacity", 1)
        }

        if(is_matched === false){    
            var arr = new Array(selected_names.length);
            var maxn = new Array(selected_names.length).fill(0);

            for (var i = 0; i < arr.length; i++) {
                arr[i] = [0, 0];
            }
            console.log(1)
            data.forEach(d => {
                var tmp = selected_names.indexOf(d['winner_name']);
                if(tmp !== -1){
                    arr[tmp][0] += 1;
                    maxn[tmp] += 1
                }

                tmp = selected_names.indexOf(d['loser_name']);
                if(tmp !== -1){
                    arr[tmp][1] += 1;
                    maxn[tmp] += 1
                }
                
            })
            console.log(2)

            var stack_data = [];
            selected_names.forEach((e,i)=>{
                stack_data.push({"group":e, "win":arr[i][0], "lose":arr[i][1]})
            });
            
            console.log(stack_data);

            const subgroups = ['win','lose'];
            const groups = stack_data.map(d => (d.group));

            // Add X axis
            this.xScale = d3.scaleBand()
                             .domain(groups)
                             .range([0, this.width])
                             .padding([0.2]);
                            
            this.xAxis
                    .attr("transform", `translate(${this.margin.left}, ${this.margin.top + this.height})`)
                    .transition()
                    .call(d3.axisBottom(this.xScale).tickSizeOuter(0));

            // // Add Y axis
            this.yScale = d3.scaleLinear()
                          .domain([0, Math.max(...maxn)])
                          .range([ this.height, 0 ]);

            this.yAxis
                    .attr("transform", `translate(${this.margin.left}, ${this.margin.top})`)
                    .transition()
                    .call(d3.axisLeft(this.yScale));

            // color palette = one color per subgroup
            const color = d3.scaleOrdinal()
                    .domain(subgroups)
                    .range(['#C0C0C0', '#404040'])

            //stack the data? --> stack per subgroup
            const stackedData = d3.stack()
                    .keys(subgroups)
                    (stack_data)
            
                
                // Show the bars
            this.bars = this.container
                //.attr("transform", `translate(${this.margin.left}, ${this.margin.top})`)
                .selectAll("g")
                // Enter in the stack data = loop key per key = group per group
                .data(stackedData)
                .join("g")
                .attr("fill", d => color(d.key))
                .selectAll("rect")
                // enter a second time = loop subgroup per subgroup to add all rectangles
                .data(d => d)
                .join("rect")
                .on("mouseover", (e, d) => {
                    this.tooltip.select("#tooltip-inner2")
                        .html(`win: ${d[0]} <br />lose: ${d[1] - d[0]}`);
                    console.log(d)
                    Popper.createPopper(e.target, this.tooltip.node(), {
                        placement: 'top',
                        modifiers: [
                            {
                                name: 'arrow',
                                options: {
                                    element: this.tooltip.select("#tooltip-arrow2").node(),
                                },
                            },
                        ],
                    });

                    this.tooltip.style("display", "block");
                })
                .on("mouseout", (d) => {
                    this.tooltip.style("display", "none");
                });

                
            
            this.bars
                    .attr("x", d => this.xScale(d.data.group))
                    .attr("y", d => this.yScale(d[1]))
                    .attr("height", d => this.yScale(d[0]) - this.yScale(d[1]))
                    .attr("width",this.xScale.bandwidth())
                    .attr("class", 'prev_stack')
            
        }


        if(is_matched){    
            var arr = new Array(selected_names.length);
            var maxn = new Array(selected_names.length).fill(0);

            for (var i = 0; i < arr.length; i++) {
                arr[i] = new Array(selected_names.length).fill(0);
            }
            data.forEach(d => {
                var tmp = selected_names.indexOf(d['winner_name']);
                var tmp2 = selected_names.indexOf(d['loser_name']);
                arr[tmp][tmp2] += 1;
                maxn[tmp] += 1 ;

            })
            console.log('arr');
            console.log(arr);
            var stack_data = [];
            selected_names.forEach((e,i)=>{
                tmp = {"group":e};
                arr[i].forEach((e2,i2) => {
                    tmp[selected_names[i2]] = e2;
                });
                stack_data.push(tmp)
            });
            
            console.log(stack_data);

            const subgroups = selected_names;
            const groups = stack_data.map(d => (d.group));

            // Add X axis
            this.xScale = d3.scaleBand()
                             .domain(groups)
                             .range([0, this.width])
                             .padding([0.2]);
                            
            this.xAxis
                    .attr("transform", `translate(${this.margin.left}, ${this.margin.top + this.height})`)
                    .transition()
                    .call(d3.axisBottom(this.xScale).tickSizeOuter(0));

            // // Add Y axis
            this.yScale = d3.scaleLinear()
                          .domain([0, Math.max(...maxn)])
                          .range([ this.height, 0 ]);

            this.yAxis
                    .attr("transform", `translate(${this.margin.left}, ${this.margin.top})`)
                    .transition()
                    .call(d3.axisLeft(this.yScale));

            // color palette = one color per subgroup
            const color = d3.scaleOrdinal()
                    .domain(subgroups)
                    .range(d3.schemeCategory10)

            //stack the data? --> stack per subgroup
            const stackedData = d3.stack()
                    .keys(subgroups)
                    (stack_data)
            
                // Show the bars
            this.bars = this.container
                //.attr("transform", `translate(${this.margin.left}, ${this.margin.top})`)
                .selectAll("g")
                // Enter in the stack data = loop key per key = group per group
                .data(stackedData)
                .join("g")
                .attr("fill", d => color(d.key))
                .selectAll("rect")
                // enter a second time = loop subgroup per subgroup to add all rectangles
                .data(d => d)
                .join("rect")
                .on("mouseover", (e, d) => {
                    this.tooltip.select("#tooltip-inner2")
                        .html(`win: ${d[1]}`);
                    console.log(d)
                    Popper.createPopper(e.target, this.tooltip.node(), {
                        placement: 'top',
                        modifiers: [
                            {
                                name: 'arrow',
                                options: {
                                    element: this.tooltip.select("#tooltip-arrow2").node(),
                                },
                            },
                        ],
                    });

                    this.tooltip.style("display", "block");
                })
                .on("mouseout", (d) => {
                    this.tooltip.style("display", "none");
                });

            this.bars
                    .attr("x", d => this.xScale(d.data.group))
                    .attr("y", d => this.yScale(d[1]))
                    .attr("height", d => this.yScale(d[0]) - this.yScale(d[1]))
                    .attr("width",this.xScale.bandwidth())
                    .attr("class", 'prev_stack')
            
            
        }
    }
}
