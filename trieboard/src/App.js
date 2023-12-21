import logo from './logo.svg';
import './App.css';
import BarChart from './Components';
import * as d3 from "d3"

function App() {

  // const svg = d3.select("body").append("svg").attr("width", 700).attr("height", 300);
  // svg = svg.selectAll("rect")
  // .data(data)
  // .enter()
  // .append("rect")
  // .attr("x", (d, i) => {i + 70})
  // .attr("y", (d, i) => { 0 })
  // .attr("width", 60)
  // .attr("height", (d, i) => { d * 10})
  // .attr("fill", "green");
  // d3.json("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/data_network.json", function(data) {
  //   console.log(data);
  //   var link = svg.selectAll("line")
  //   .data(data.links)
  //   .enter()
  //   .append("line")
  //   .style("stroke", "#aaa");

  //   var node = svg.selectAll("circle")
  //   .data(data.nodes)
  //   .enter()
  //   .append("circle")
  //   .attr("r", 20)
  //   .style("fill", "#69b3a2");

  //   var simulation = d3.forceSimulation(data.nodes)
  //   .force("link", d3.forceLink().id(d => d.id).links(data.links))
  //   .force("charge", d3.forceManyBody().strength(-400))
  //   .force("center", d3.forceCenter(400 / 2, 400 / 2))
  //   .on("end", ticked);

  //   function ticked() {
  //     link
  //       .attr("x1", function(d) { return d.source.x; })
  //       .attr("y1", function(d) { return d.source.y; })
  //       .attr("x2", function(d) { return d.target.x; })
  //       .attr("y2", function(d) { return d.target.y; });

  //       node
  //       .attr("cx", function (d) { return d.x+6; })
  //       .attr("cy", function(d) { return d.y-6; });
  //   }
  // });

  return (
    <div className="App">
      <BarChart/>
      {/* <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header> */}
    </div>
  );
}

export default App;
