document.getElementById('loadGraphBtn').addEventListener('click', getFullGraph);
document.getElementById('loadLayerGraphBtn').addEventListener('click', getRootNode);
//document.getElementById('loadLayerGraphBtn').addEventListener('click', getLayedData);



function getFullGraph() {

    fetch('/api/data')
        .then(response => response.json())
        .then(graph => {
            const svg = d3.select("svg"),
                width = +svg.attr("width"),
                height = +svg.attr("height");

            svg.selectAll("*").remove();

            const simulation = d3.forceSimulation()
                .force("link", d3.forceLink().distance(70))
                .force("charge", d3.forceManyBody())
                .force("center", d3.forceCenter(width / 2, height / 2));

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
                .attr("r", 15)
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
                //.text(d => d.properties.Name); // Assuming each node has a 'name' property
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

    const g = svg.append("g").attr("transform", "translate(40,0)");

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

async function handleClick(event, d) {
    alert("Node clicked");
    console.log('Node clicked:', d.data.properties.Name);

    console.log(d.data.properties.Name);  // Check the value

    try {
        const children = await fetch(`/api/ChildData?type=${d.data.properties.Name}`).then(res => res.json());
        if (!Array.isArray(children)) {
            throw new Error('Expected an array of children');
        }
        console.log('Data received', children);

        const svg = d3.select("#graph");
        const escapedId = d.data.properties.Name.replace(/([@.])/g, '\\$1');
        const projectNode = svg.select(`#${escapedId}`);
        //const projectNode = svg.select(`#${d.data.properties.Name}`); // Use the correct ID selector

        // Get the bounding box of the node
        const bbox = projectNode.node().getBBox();
        const projectNodeX = bbox.x + bbox.width / 2;
        const projectNodeY = bbox.y + bbox.height / 2;

        children.forEach((kid, index) => {
            const newNodeX = projectNodeX + 100; // Adjust the position as needed
            const newNodeY = projectNodeY + 50 * (index + 1); // Adjust the position as needed

            const newNode = svg.append("g")
                .attr("class", "node")
                .attr("transform", `translate(${newNodeX},${newNodeY})`)
                .call(drag); // Apply the drag behavior

            newNode.append("rect")
                .attr("width", 100)
                .attr("height", 40)
                .attr("x", -30)
                .attr("y", -10)
                .attr("id", kid.properties.Name)
                .attr("class", "child-node")
                .on("click", (event) => handleClick(event, { data: { properties: kid.properties } })); // Ensure the correct data is passed

            newNode.append("text")
                .attr("dy", 3)
                .attr("x", 0)
                .style("text-anchor", "middle")
                .text(kid.properties.Name);

            // Draw the link
            svg.append("path")
                .attr("class", "link")
                .datum({ source: { x: projectNodeX, y: projectNodeY }, target: { x: newNodeX, y: newNodeY } })
                .attr("d", `
                    M${projectNodeX},${projectNodeY}
                    C${projectNodeX},${(projectNodeY + newNodeY) / 2}
                     ${newNodeX},${(projectNodeY + newNodeY) / 2}
                     ${newNodeX},${newNodeY}
                `);
        });

        updateLinks();
    } catch (error) {
        console.error('Error fetching children data:', error);
    }
}

async function getRootNode() {
    try {
        const response = await fetch('/api/treedata');

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const text = await response.text();
        let root;
        try {
            root = JSON.parse(text);
        } catch (jsonError) {
            throw new Error('Malformed JSON data');
        }

        const svg = d3.select("svg"),
            width = +svg.attr("width"),
            height = +svg.attr("height");

        svg.selectAll("*").remove();

        const margin = { top: 20, right: 0, bottom: 0, left: 0 };
        const g = svg.append("g").attr("transform", `translate(40,${margin.top})`);

        const rootNode = d3.hierarchy(root);

        const node = g.append("g")
            .attr("class", "node root-node");
        //.attr("transform", `translate(${width / 2},${height / 2})`);

        node.append("rect")
            .attr("width", 150)
            .attr("height", 40)
            .attr("x", -50)
            .attr("y", -20)
            .attr("id", rootNode.data.properties.Name)
            .attr("class", "root-node")
            .on("click", (event, d) => handleClick(event, rootNode));

        node.append("text")
            .attr("dy", 3)
            .attr("x", 0)
            .style("text-anchor", "middle")
            .text(rootNode.data.properties.Name);

        console.log('Root Node:', node);
    } catch (error) {
        console.error('Error fetching or processing tree data:', error);
    }
}