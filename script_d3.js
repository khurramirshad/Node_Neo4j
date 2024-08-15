document.getElementById('loadGraphBtn').addEventListener('click', getFullGraph);
document.getElementById('loadLayerGraphBtn').addEventListener('click', fetchAndRenderRoot);
document.getElementById('loadImplementation').addEventListener('click', getLayedData);
document.getElementById('BtnSearchNode').addEventListener('click', getSearchGraph);

function getSearchGraph() {
    const ent = document.getElementById('selectNodeType').value;
    const id = document.getElementById('searchNodeName').value;
    const type = "Search";
    fetchAndRenderRoot(type, id, ent);

}

function getFullGraph() {
    fetch('/api/data')
        .then(response => response.json())
        .then(graph => {
            const svg = d3.select("svg"),
                width = +svg.attr("width"),
                height = +svg.attr("height");

            svg.selectAll("*").remove();

            const simulation = d3.forceSimulation()
                .force("link", d3.forceLink().distance(150))
                .force("charge", d3.forceManyBody())
                .force("center", d3.forceCenter((width / 2) + 200, (height / 2) + 350));

            const link = svg.append("g")
                .attr("class", "links")
                .selectAll("line")
                .data(graph.links)
                .enter().append("line")
                .attr("class", "link");

            const node = svg.append("g")
                .attr("class", "nodes")
                .selectAll("g")
                .data(graph.nodes)
                .enter().append("g")
                .attr("transform", d => `translate(${d.x}, ${d.y})`);

            node.append("circle")
                .attr("class", "node")
                .attr("r", 20)
                .style("fill", function (d) {
                    if (d.labels.includes("Commit")) {
                        return "red";
                    } else if (d.labels.includes("Class")) {
                        return "blue";
                    } else if (d.labels.includes("Developer")) {
                        return "yellow";
                    } else {
                        return "green";
                    }
                })
                .call(d3.drag()
                    .on("start", dragstarted)
                    .on("drag", dragged)
                    .on("end", dragended));

            node.append("text")
                .attr("class", "label")
                .text(d => d.properties.Name.length > 7 ? d.properties.Name.substring(0, 7) + '...' : d.properties.Name);

            simulation
                .nodes(graph.nodes)
                .on("tick", ticked);

            simulation.force("link")
                .links(graph.links);

            function ticked() {
                node.attr("transform", d => `translate(${d.x}, ${d.y})`);

                link
                    .attr("x1", d => d.source.x)
                    .attr("y1", d => d.source.y)
                    .attr("x2", d => d.target.x)
                    .attr("y2", d => d.target.y);
            }

            function dragstarted(event, d) {
                if (!event.active) simulation.alphaTarget(0.3).restart();
                d.fx = d.x;
                d.fy = d.y;
            }

            function dragged(event, d) {
                d.fx = event.x;
                d.fy = event.y;
            }

            function dragended(event, d) {
                if (!event.active) simulation.alphaTarget(0);
                d.fx = null;
                d.fy = null;
            }
        });
}

function getLayedData() {
    const data = {
        "name": "Root",
        "children": [
            {
                "name": "Child 1",
                "children": [
                    { "name": "Grandchild 1" },
                    { "name": "Grandchild 2" }
                ]
            },
            {
                "name": "Child 2",
                "children": [
                    { "name": "Grandchild 3" },
                    { "name": "Grandchild 4" }
                ]
            }
        ]
    };

    const svg = d3.select("svg"),
        width = +svg.attr("width"),
        height = +svg.attr("height");

    // Clear existing SVG content
    svg.selectAll("*").remove();

    const g = svg.append("g").attr("transform", "translate(60,50)");

    const tree = d3.tree().size([height, width - 160]);

    const root = d3.hierarchy(data);

    tree(root);

    const link = g.selectAll(".link")
        .data(root.descendants().slice(1))
        .enter().append("path")
        .attr("class", "link")
        .attr("d", d => `
            M${d.y},${d.x}
            C${(d.y + d.parent.y) / 2},${d.x}
             ${(d.y + d.parent.y) / 2},${d.parent.x}
             ${d.parent.y},${d.parent.x}
        `);

    const node = g.selectAll(".node")
        .data(root.descendants())
        .enter().append("g")
        .attr("class", d => "node" + (d.children ? " node--internal" : " node--leaf"))
        .attr("transform", d => `translate(${d.y},${d.x})`);

    node.append("circle")
        .attr("r", 10);

    node.append("text")
        .attr("dy", 3)
        .attr("x", d => d.children ? -12 : 12)
        .style("text-anchor", d => d.children ? "end" : "start")
        .text(d => d.data.name);

}

// Define the drag behavior
const drag = d3.drag()
    .on("start", function (event, d) {
        d3.select(this).raise().attr("stroke", "black");
    })
    .on("drag", function (event, d) {
        if (d) {
            d.x = event.x;
            d.y = event.y;
            d3.select(this).attr("transform", `translate(${d.x},${d.y})`);
            updateLinks();
        }
    })
    .on("end", function (event, d) {
        d3.select(this).attr("stroke", null);
    });

function updateLinks() {
    d3.selectAll(".link").attr("d", function (d) {
        const source = d.source;
        const target = d.target;
        return `
            M${source.x},${source.y}
            C${source.x},${(source.y + target.y) / 2}
             ${target.x},${(source.y + target.y) / 2}
             ${target.x},${target.y}
        `;
    });
}

async function fetchAndRenderRoot(type, id, ent) {

    if (type == null || id == null) {

        type = "root";
        id = "none";
        ent="none";
    }

    try {
        // const response = await fetch(`/api/ChildData?type=root`);
        const response = await fetch(`/api/ChildData?id=${id}&type=${type}&ent=${ent}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const root = await response.json();
        console.log("Error in record",root);
        

        const svg = d3.select("svg"),
            width = +svg.attr("width"),
            height = +svg.attr("height");

        svg.selectAll("*").remove();

        const margin = { top: 25, right: 0, bottom: 0, left: 0 };
        const g = svg.append("g");//.attr("transform", `translate(60,${margin.top})`);

        const rootNode = d3.hierarchy(root);
        console.log(rootNode);
        const node = g.append("g")
            .attr("class", "node root-node")
            .call(drag);

        node.append("rect")
            .attr("width", 150)
            .attr("height", 40)
            .attr("x", 3)
            .attr("y", 2)
            .attr("id", `node-${rootNode.data[0].id}`)
            .attr("class", "Project")
            .on("click", (event) => handleClick(event, root[0]));

        node.append("text")
            .attr("dy", 15)
            .attr("x", 70)
            .style("text-anchor", "middle")
            .text(rootNode.data[0].properties.Name);


    } catch (error) {
        console.error('Error fetching or processing tree data:', error);
    }
}

async function handleClick(event, d) {
    //console.log('Node clicked:', d);

    try {
        // const children = await fetch(`/api/ChildData?type=${d.properties.Name}`).then(res => res.json());
        const children = await fetch(`/api/ChildData?id=${d.properties.Name}&type=${d.labels[0]}`)
            .then(res => res.json());
        if (!Array.isArray(children)) {
            throw new Error('Expected an array of children');
        }
        console.log('Data received', children);

        const svg = d3.select("svg");
        // const escapedId = d.data.id.toString().replace(/([@.#])/g, '\\$&');
        const projectNode = svg.select(`#node-${d.id}`);
        console.log('Project Node', projectNode.node());

        const bbox = projectNode.node().getBBox();
        const projectNodeX = bbox.x + bbox.width / 2;
        const projectNodeY = bbox.y + bbox.height;


        renderChildren(svg, d.id, children, projectNodeX, projectNodeY);
    } catch (error) {
        console.error('Error fetching children data:', error);
    }
}

function renderChildren(svg, parentNodeid, children, parentNodeX, parentNodeY) {

    // const parentNode = d3.select(`#node-${parentNodeid}`);      
    // const bbox = parentNode.node().getBBox();
    // const parentNodeX = bbox.x + bbox.width / 2;
    // const parentNodeY = bbox.y + bbox.height ;


    children.forEach((kid, index) => {
        const newNodeX = parentNodeX + 100;
        const newNodeY = parentNodeY + 50 * (index + 1);

        // console.log("projectNodeX) :",parentNodeid,parentNodeX, newNodeX);
        // console.log("projectNodeY) :",parentNodeid,parentNodeY,newNodeY); 
        // Draw the link first
        svg.append("path")
            .attr("class", "link")
            .datum({ source: { x: parentNodeX, y: parentNodeY }, target: { x: newNodeX, y: newNodeY } })
            .attr("d", `
                M${parentNodeX},${parentNodeY}
                C${parentNodeX},${(parentNodeY + newNodeY) / 2}
                 ${newNodeX},${(parentNodeY + newNodeY) / 2}
                 ${newNodeX},${newNodeY}
            `);

        // Append the new node after the link
        const newNode = svg.append("g")
            .attr("class", "node");
        //.attr("transform", `translate(${newNodeX},${newNodeY})`);
        //.call(drag);

        console.log(kid.labels);
        let classname = kid.labels[0];
        newNode.append("rect")
            .attr("width", 150)
            .attr("height", 40)
            .attr("x", newNodeX)
            .attr("y", newNodeY)
            .attr("id", `node-${kid.id}`)
            .attr("class", classname)
            .on("click", (event) => handleClick(event, kid));

        newNode.append("text")
            .attr("y", newNodeY + 20)
            .attr("x", newNodeX + 70)
            .style("text-anchor", "middle")
            .text(kid.properties.Name.length > 20 ? kid.properties.Name.substring(0, 20) + '...' : kid.properties.Name);
    });

    updateLinks();
}