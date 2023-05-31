class DataTable {
    constructor(id) {
        this.id = id;
    }

    update(data, columns) {
        //d3.selectAll("." + 'prev_tab').transition().style("opacity", 0)
        
        let table = d3.select(this.id);

        console.log(columns)
        let rows = table
            .selectAll("tr")
            .data(data)
            .attr("class", 'prev_tab')
            .join("tr");

        rows.selectAll("td")
            .data(d => columns.map(c => d[c]))
            .join("td")
            .text(d => d)
    }
}
