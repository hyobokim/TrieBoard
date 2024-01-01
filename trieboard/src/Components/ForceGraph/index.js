import React, {Component, useEffect, useRef, useState} from "react";
import TypeInput from "../TypeInput";
import Trie from "../prefixTree";
import * as d3 from "d3";

const ForceGraph = () => {
    var margin = {top: 0, right: 5, bottom: 40, left: 100},
        width = window.innerWidth - margin.left - margin.right,
        height = window.innerHeight -margin.top - margin.bottom,
        node_radius = 30,
        text_size = "2em";
    
    const letterColors = {
        '': '#008080',
        'a': '#FF0000',
        'b': "#FF7F00",
        'c': '#FFD400',
        'd': "#FFFF00",
        'e': '#BFFF00',
        'f': "#6AFF00",
        'g': '#00EAFF',
        'h': "#0095FF",
        'i': '#0040FF',
        'j': "#AA00FF",
        'k': '#FF00AA',
        'l': "#EDB9B9",
        'm': '#ff00ff',
        'n': "#B9EDE0",  // these next two are very similar, maybe change?
        'o': '#B9D7ED',
        'p': "#DCB9ED",
        'q': '#8F2323',
        'r': "#8F6A23",
        's': '#4F8F23',
        't': "#23628F",
        'u': '#6B238F',
        'v': "#000000",
        'w': '#737373',
        'x': "#CCCCCC",
        'y': '#E7E9B9',
        'z': "#8b4513",
    }
    const [data, setData] = useState(
        // Data is ordered sequentially, i.e. most recent data is at the end of list 
        {
            "nodes": [{"id": "", "text": "", "group": "", "current": false, "endOfWord": false}],
            "links": []
        }
        );

    const [trie, setTrie] = useState(new Trie());
    const ref = useRef();

    useEffect(() => {
        const nodes = data.nodes;
        const links = data.links;

        const svg = d3.select(ref.current).attr("width", width).attr("height", height);
        const nodeTextGroup = svg.selectAll("g");

        // Keep a copy of the previous zoom state to preserve zoom level
        const prevZoom = d3.zoomTransform(svg.node());

        const enteredNodeTextGroup = nodeTextGroup.data(nodes, d => d.id).enter().append("g")
        
        // add the circle
        const node = enteredNodeTextGroup
        .append("circle")
        .attr("cx", width / 2)
        .attr("cy", height / 2)
        .attr("id", d => d.id);

        node
        .transition()
        .attr("r", node_radius);
        
        // add the text
        const nodeText = enteredNodeTextGroup
        .append("text")
        .text(d => d.text)
        .attr("font-size", text_size)
        .style("dominant-baseline", "middle") // vertical alignment
        .style("text-anchor", "middle")       // horizontal alignment

        const circleSelector = data.nodes.length > 2 ? `#${data.nodes.slice(-1)[0].id}, #${data.nodes.slice(-2)[0].id}` : "circle"
        // Style the circles  
        svg.selectAll(circleSelector)
        .style("fill",  d => letterColors[d.id.slice(0, 1)])
        .style("stroke", d => d.current ? "yellow" : "black")
        .style("stroke-width", "5");
        node.append("title").text(d => d.id);

        let link = svg.selectAll("line")
        .data(links)

        link = link
        .enter()
        .append("line")
        .attr("stroke", "#999")
        .attr("stroke-opacity", 0.6)
        .merge(link);

        const simulation = d3.forceSimulation(nodes)  // S3 simulation to apply forces between nodes in the graph 
        .force("link", d3.forceLink(links).id(d => d.id))
        .force("charge", d3.forceManyBody().strength(-200))
        // .force("x", d3.forceX())
        // .force("y", d3.forceY())
        // .force("center", d3.forceCenter(width / 2, height / 2))
        .force("collide", d3.forceCollide(50))
        .on("tick", ticked); 

        if (data.nodes.length === 1) {
            simulation.force("center", d3.forceCenter(width / 2, height / 2));
        } else {
            simulation
            // .force("center", d3.forceCenter().strength(0))
            .force("x", d3.forceX(width / 2))
            .force("y", d3.forceY(height / 2));
        }

        function ticked() {
            svg.selectAll("line")
                .attr("x1", d => d.source.x)
                .attr("y1", d => d.source.y)
                .attr("x2", d => d.target.x)
                .attr("y2", d => d.target.y);

            svg.selectAll("circle")
            .attr("cx", d => d.x)
            .attr("cy", d => d.y);

            svg.selectAll("text")
            .attr("x", d => d.x)
            .attr("y", d => d.y);
        };

        nodeTextGroup.call(d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended));

        function dragstarted(event) {
            if (!event.active) simulation.alphaTarget(0.1).restart();
            event.fx = event.subject.x;
            event.fy = event.subject.y;
        };
        
        // // Update the subject (dragged node) position during drag.
        function dragged(event) {
            event.subject.fx = event.x;
            event.subject.fy = event.y;
        };
    
        // // Restore the target alpha so the simulation cools after dragging ends.
        // // Unfix the subject position now that it’s no longer being dragged.
        function dragended(event) {
            if (!event.active) simulation.alphaTarget(0);
            event.subject.fx = null;
            event.subject.fy = null;
        };

        simulation.alpha(0.5).restart();

        const zoomHandler = d3.zoom().on('zoom', (event) => {
            // Apply transformations to the entire graph (nodes, links, etc.)
            svg.selectAll("g").attr('transform', event.transform);
            link.attr('transform', event.transform);
          });
        
        // Apply the zoom behavior to the SVG
        svg.call(zoomHandler);
        // nodeTextGroup.call(zoomHandler);
        svg.call(zoomHandler.transform, prevZoom);

    }, [data])

    function addCurrentWordToGraph(word) {
        const lastLetter = word.slice(-1);

        let lastNode = data["nodes"].slice(-1)[0];
        lastNode.current = false; // set the previous current node to false, as we are adding a new currrent

        if (!(trie.hasSequence(word))) {
            // If the letters so far dont exist in the trie, create new nodes 
            // Add a node to the data set so it shows up on the Force Graph 

            let lastNode = data["nodes"].slice(-1)[0];
            lastNode.current = false // set the previous current node to false, as we are adding a new currrent

            const newState = [...data.nodes, {"id": word, "text": lastLetter, "group": word, "current": true, "endOfWord": false}];

            let newLinks; 
            if (word.length === 1) {
                newLinks = data.links;
            } else {
                newLinks = [...data.links, {"source": word, "target": word.slice(0, -1)}]
            }
            setData(
                {
                    "nodes": newState, 
                    "links": newLinks}
                ); 

        } else {
            // Letters already exist in the node. We still want to highlight though, so mark the node as current
            let wordNode = data.nodes.filter(n => n.id === word)[0];
            wordNode.current = true;

            setData(
                {
                    "nodes": [...data.nodes.filter(n => (n.id !== word)), wordNode], 
                    "links": data.links
                }
            )
        }
    }

    /**
     * Take the current word and finalize it in the graph if it isnt already finalized, 
     * i.e. input it into the prefixTree and set the last letter as the end of the word 
     * @param {String} word 
     */
    function finalizeWord(word) {
        const nodeCreated = trie.insert(word);

        let lastNode = data["nodes"].slice(-1)[0];
        lastNode.endOfWord = true;
        lastNode.current = false;

        setData(
            {
                "nodes": [...data.nodes.slice(0, -1), lastNode], 
                "links": data.links}
            ); 

        setTrie(new Trie(trie.root)); // update the trie 
    }

    function handleInput(e) {
        const letters = /^[A-Za-z]+$/;

        const lastLetter = e.target.value.slice(-1);

        if (lastLetter.match(letters)) {
            addCurrentWordToGraph(e.target.value);
        } else if (lastLetter === ' ' && e.target.value.slice(0, -1).length !== 0) {
            finalizeWord(e.target.value.slice(0, -1)); // remove last letter, since it is just a space
        } else {
            return;
        }
    }

    return <div>
        <svg ref={ref}/>
        <TypeInput handler={handleInput}></TypeInput>
    </div>
}

export default ForceGraph