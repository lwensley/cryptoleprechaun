// start and end for main charts/slider
var start_date = "20190318"; // has to be smaller than last date in csv file 
var end_date = "20190618"; // should be last date in the csv file 
var trends_start_date; // for passing start to goog trends widget 
var trends_end_date;

$("#slider").dateRangeSlider({ //date range slider setup max and min dates the $ in front just means it's jquery 
 bounds:{
   min: new Date(2018, 05, 18), // ***need to make sure we have the data within this max min range****   
   max: new Date(2019, 05, 18) // these dates are objects not strings and month starts zero so subtract one from the month number
   }
 });
 $("#slider").dateRangeSlider("values", new Date(2019, 02, 18), new Date(2019, 05, 18)); // this sets the default values of the slider tab (and chart) 
console.log("right after slider set up code");

function makeResponsive() {

  // first SET VARIABLES AND CONSTANTS

  var svgWidth = window.innerWidth;
  var svgHeight = window.innerHeight; 

  var margin = {
    top: 10,
    right: 150,
    bottom: 120,
    left: 150
  };

  var candle_win_height = (window.innerHeight - margin.bottom - margin.top) * 4/5;
  var candle_win_width = window.innerWidth - margin.left - margin.right; //size of the candlestick and volume rect 
  var indicator_win_height = (window.innerHeight - margin.bottom - margin.top) * 1/5;; //size of indicator rect 
  var indicator_win_width = candle_win_width; //size of indicator rect 

  const candle_win_ratio = 4/5;
  const volume_win_ratio = 1/4;

  //Clear SVG --> required for "make responsive" function
  var svgArea = d3.select("#svg-area").select("svg");

  if (!svgArea.empty()) {
    svgArea.remove();
    }

  // Append the SVG cointainer, set its height and width, and create a variable which references it  
  var svg = d3
    .select("#svg-area") 
    .append("svg")
    .attr("height", svgHeight)
    .attr("width", svgWidth); 
  
  // Create a chart group for the Indicator Chart
  var IndicatorChartGroup = svg.append("g");

  // Create a chart group for the Indicator Chart
  var CandleChartGroup = svg.append("g");
 
  // CREATE FUNCTIONS

  // function used for updating indicator scale variable upon click on indicator axis label
  function iScale(selectdata, chosenIaxis, indicator_win_height) {
   
    // create scales
    var iLinearScale = d3.scaleLinear()

      .domain([d3.max(selectdata, d => d[chosenIaxis]), d3.min(selectdata, d => d[chosenIaxis])])
      .range([0, (indicator_win_height)]); //

      return iLinearScale;
  }


  // function used for updating indicator axis variable upon click on axis label
  function renderIaxis(newIScale, iAxis) {
    
    var leftiAxis = d3.axisLeft(newIScale)
      .ticks(6);

    iAxis
      .transition()
      .duration(1000)
      .call(leftiAxis);

    return iAxis;
  }


  // function used for updating lines group with a transition to new lines
  function renderLines(iLinesGroup, ind_values, bar_width, i, min_i, i_scaler) {

    iLinesGroup
      // .transition()
      // .duration(1000)
      .attr("x1", bar_width * (i-1)+margin.left) //previous line x pos 
      .attr("x2", bar_width * i+margin.left) // current line xpos
      .attr("y1", indicator_win_height+candle_win_height-(ind_values[i-1]-min_i)*i_scaler+margin.top) //y pos for previous 
      .attr("y2", indicator_win_height+candle_win_height-(ind_values[i]-min_i)*i_scaler+margin.top) // y pos for current

    // updateToolTip function above csv import
    iLinesGroup = updateToolTip(selectdata, chosenIaxis, iLinesGroup, ind_values, i);

    return iLinesGroup;

  }


  // function used for updating indicator group with new tooltip
  function updateToolTip(selectdata, chosenIaxis, iLinesGroup, ind_values, i) {

    if (chosenIaxis === "bitfinex_shorts") {
      var labeli = "Shorts: ";
    }

    else {
      var labeli = "Dominance: ";
    }

    // format tooltip data
    var datei = selectdata[i]["date (formatted)"];
    datei = formatDate2(datei);

    var valuei = ind_values[i];
    valuei = valuei.toFixed(2);


    var toolTip = d3.tip()
      .attr("class", "d3-tip")
      .offset([0, 0])
      .html(function() { 
        // console.log(selectdata[i]["date (formatted)"])
        return (`${labeli} <br> ${datei} ${"$" + valuei}`);
      });

    iLinesGroup.call(toolTip);

    iLinesGroup.on("mouseover", function(data) {
      toolTip.show(data, this);
    })
      // onmouseout event
      .on("mouseout", function(data, index) {
        toolTip.hide(data);
      });

    return iLinesGroup;
  }



  // SET FIRST CHOSEN INDICATOR
  var chosenIaxis = "bitfinex_shorts";



// PARSE DATE/TIME FUNCTIONS

// Instuctionrs: https://github.com/d3/d3-time-format/blob/master/README.md

  //var formatTime = d3.timeFormat("%e-%b-%y"); // output Jan 1, 2014
  //formatTime(new Date); // "June 30, 2015"
  var parseDate = d3.timeParse("%Y%d%e"); //  
  //var parseDate = d3.timeParse("%Y%m%d"); //input 20180926 format   
  var parseDate2 = d3.timeParse("%Y-%m-%d"); //I think this is for drop down datepicker 

  // var startdate = parseDate(start_date);
  // var enddate = parseDate(end_date);
  // console.log(startdate)
  // console.log(enddate)

  var formatDate = d3.timeFormat("%Y%m%d");
  var formatDate2 = d3.timeFormat("%e %b %y");


// START OF ACTIONABLE CODE

  // get data from CSV and parse the date 
  d3.json(`/btc_data`).then(function(data)  {

    // convert json data to more readable format
    data = data[0]
    // console.log(data)

    // get date (as a string)
    var date_str = data["date"];
    // console.log(date_str)

    // convert date to number
    var date_parse = [];
    for (x in date_str) {
      datex = parseDate2(date_str[x])
      date_parse.push(datex);
    }
    // console.log(date)
    var date_alldata = []
    for (x in date_parse) {
      datex = formatDate(date_parse[x])
      date_alldata.push(+datex);
    }
    // console.log(date_alldata)
    
    // pull remaining data from JSON page 
    var open_alldata = data["open"];
    var close_alldata = data["close"];
    var high_alldata = data["high"];
    var low_alldata = data["low"];
    var volume_alldata = data["unit_volume"];
    var finex_shorts_alldata = data["bitfinex_shorts"];
    var finex_leveraged_longs_alldata = data["bitfinex_longs"];
    var finex_volume_alldata = data["bitfinex_volume"];
    var bitcoin_dominance_alldata = data["bitcoin_dominance"];
    var rolling_20_d_alldata = data["rolling_20_d"];
    // bitmex_funding_alldata = data["bitmex_funding"];

    // Create lists
    var date = [];
    var open = [];
    var close = [];
    var high = [];
    var low = [];
    var volume = [];
    var finex_shorts = []; 
    var finex_leveraged_longs = [];
    var finex_volume = [];
    var bitcoin_dominance = [];
    var rolling_20_d = [];
    // var bitmex_funding = []

    // calculate length of data
    data_length = date_alldata.length;
 
    // loop through and only pick-up data within start- and end- date
    for (i = 0; i < data_length; i++) {

      if (date_alldata[i] >= start_date) {
        if (date_alldata[i] <= end_date) {
            date.push(date_alldata[i]);
            open.push(open_alldata[i]);
            close.push(close_alldata[i]);
            high.push(high_alldata[i]);
            low.push(low_alldata[i]);
            volume.push(volume_alldata[i]);
            finex_shorts.push(finex_shorts_alldata[i]);
            finex_leveraged_longs.push(finex_leveraged_longs_alldata[i]);
            finex_volume.push(finex_volume_alldata[i]);
            bitcoin_dominance.push(bitcoin_dominance_alldata[i]);
            rolling_20_d.push(rolling_20_d_alldata[i]);
            // bitmex_funding.push(bitmex_funding_alldata[i]);
        }
      }
    }
    // convert date as number to date as date
    var parseTime3 = d3.timeParse("%Y%m%d");
        
    var date_asdate = []
    for (x in date) {
      datex = parseTime3(date[x])
      date_asdate.push(+datex);
    }

    // calculate length of new selected data
    selected_data_length = date.length;

    // combine new data into single object
    selectdata = []

    for (i = 0; i < selected_data_length; i++) {
      datai = {"date (formatted)": date_asdate[i],
               "date": date[i],
              "open": open[i],
              "close": close[i],
              "high": high[i],
              "low": low[i],
              "volume": volume[i],
              "bitfinex_shorts": finex_shorts[i],
              "finex_leveraged_longs": finex_leveraged_longs[i],
              "finex_volume": finex_volume[i],
              "bitcoin_dominance": bitcoin_dominance[i],
              "rolling_20_d": rolling_20_d[i],
              // "bitmex_funding": bitmex_funding[i]
      }
      selectdata.push(datai)
    }

    // console.log(selectdata)

    // console.log(d3.max(selectdata, d => d["bitcoin_dominance"]))


      // //need to put start_date and end_date into right format for google trends widget  
      // var year = start_date.slice(0,4)+"-";
      // var month = start_date.slice(4,6)+"-";
      // var day = start_date.slice(6,8);
      // trends_start_date = year+month+day;
      // console.log(trends_start_date);
      // var year = end_date.slice(0,4)+"-";
      // var month = end_date.slice(4,6)+"-";
      // var day = end_date.slice(6,8);
      // trends_end_date = year+month+day;
      // console.log("trends start right after calculated 186 then end",trends_start_date, trends_end_date);
      // //date.push(day.concat(month.concat(year))); // I should have ParseDate here but then nothing shows on x-axis 
      // //goog_trends_date.push(year.concat(month.concat(day))); 
  
    // calcualate values for volume and candlestick size setup 
    var max_volume = Math.max.apply(0, volume);
    const vol_max_height = volume_win_ratio * candle_win_height;
    const vol_base=candle_win_height;  
    var bar_width = candle_win_width/volume.length;
    const candlestick_max_height = candle_win_ratio * candle_win_height - margin.top; //for the wicks gives us a 382 range  
    var highest_wick = Math.max.apply(0, high); // 
    var lowest_wick = d3.min(low); // 
    const scaler = candlestick_max_height / (highest_wick-lowest_wick); //scaler for candlestick window 


    // CREATE X-AXIS

    // set x-scale
    var xScale = d3.scaleTime()//scaleBand()
      .domain([d3.min(date_asdate), d3.max(date_asdate)]) // need to parse the date I think  
      .range([0, candle_win_width]);
    
    // create x-axis
    var xAxis = d3.axisBottom(xScale)
      .tickFormat(d3.timeFormat("%e %b %y"))// d3 v4 
      .ticks(15); // working, correct cormat 

    // add x-axis to CandleChartGroup
    CandleChartGroup.append("g") 
      .attr("transform", `translate(${margin.left}, ${candle_win_height+margin.top})`) //x-axis ie date
      .style("font", "12px sans-serif")
      .style("stroke", "grey")
      .call(xAxis);


    // CANDLE Y-AXIS

    // set y-scale for the candles
    var yScale = d3.scaleLinear()
      .domain([d3.max(high), d3.min(low)])
      .range([0, candle_win_height]); //was candle_win_ratio * ************************** */
    
    // create candle y-axis
    var yAxis = d3.axisLeft(yScale) //candlestick y axis 
      .ticks(10); 

    // add candle y-axis to CandleChartGroup
    CandleChartGroup.append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`) // main price axis 
      .style("font", "12px sans-serif")
      .style("stroke", "grey")
      .call(yAxis)


    // TRADING VOLUME Y-AXIS

    // set y-scale for trading volume
    var yScale2 = d3.scaleLinear() 
      .domain([d3.max(volume), 0])
      .range([0, volume_win_ratio*candle_win_height]);
    
    // create trading volume y-axis
    var yAxis2 = d3.axisRight(yScale2) // volume y axis
      .ticks(5);

    // add trading volume y-axis to CandleChartGroup
    CandleChartGroup.append("g")
      .attr("transform", `translate(${margin.left+candle_win_width}, ${(1-volume_win_ratio)*candle_win_height+margin.top})`) //volume axis, right side 
      .style("font", "12px sans-serif")
      .style("stroke", "grey")
      .call(yAxis2);

      
    // CREATE INDICATOR Y-AXIS VARIABLES

    // set y-scale for indicator by calling indicator scale function "iScale"
    var iLinearScale = iScale(selectdata, chosenIaxis, indicator_win_height);
    
    // // create indicator y-axis
    var leftiAxis = d3.axisLeft(iLinearScale)
      .ticks(6);
  
   // append indicator y axis
    var iAxis = IndicatorChartGroup.append("g")
      .classed("y-axis", true)
      .attr("transform", `translate(${margin.left}, ${candle_win_height+margin.top})`)
      .call(leftiAxis);


    // GRIDLINES

    // gridlines in x axis function
    function make_x_gridlines() {return d3.axisBottom(xScale)};

    // gridlines in y axis function
    function make_y_gridlines() {return d3.axisLeft(yScale)};

    
    // X-Axis gridlines
    CandleChartGroup.append("g")			
     .attr("class", "grid")
     .attr("transform", `translate(${margin.left}, ${margin.top})`)
     .style("stroke", "grey")
     .style("stroke-width", "1")
     .style("opacity", "0.1")
     .style("shape-rendering", "crispEdges") 
     .call(make_x_gridlines()
        .tickSize(candle_win_height)
        .tickFormat("")
    );

    // Y-Axis gridlines
    CandleChartGroup.append("g")	 //append gridlines to y-axis v4 D3 		
     .attr("class", "grid")
     .attr("transform", `translate(${margin.left+candle_win_width}, ${margin.top})`)
     .style("stroke", "grey")
     .style("stroke-width", "1")
     .style("opacity", "0.1")
     .style("shape-rendering", "crispEdges") 
     .call(make_y_gridlines()
        .tickSize(+candle_win_width)
        .tickFormat("")
    );


    // CHART BORDERS

    // Append one rectangle for the candlesticks and the volume charts 
    CandleChartGroup.append("rect")
      .attr("width", candle_win_width)
      .attr("height", candle_win_height)
      .attr("x", margin.left) //x location   
      .attr("y", margin.top) //y location
      //.attr("color", "green")
      .style("stroke", "grey") // works 
      .style("stroke-width", 2) // works 
      .style("opacity", .2) // works 
      .style("fill", "none"); //works and use "none" instead of false 
      
    // second rectangle below for the sentiment indicators
    IndicatorChartGroup.append("rect") // second rectangle below for the sentiment indicators 
      .attr("width", indicator_win_width)
      .attr("height" ,indicator_win_height)
      .attr("x", margin.left) //x location   
      .attr("y", margin.top+candle_win_height) //y location
      //.attr("color", "green")
      .style("stroke", "grey") // works 
      .style("stroke-width", 2) // works 
      .style("opacity", .2) // works 
      .style("fill", "none"); //works and use "none" instead of false 


    // CANDLE BARS and CANDLE WICKS

    for (i = 1; i < volume.length; i++) {  // main loop to create each chart item 
      var bar_height = volume[i]/max_volume*vol_max_height; 
      if (close[i]<close[i-1]) {bar_color="red"} // to make rising canldes/bars green and falling red 
        else {bar_color="green";
      } 
      if (open[i] < close[i]) {
        candle_y_start = open[i];  
        var candle_height = close[i]-open[i];
      }
        else {
          candle_y_start = close[i];
          var candle_height = open[i]-close[i];
      }

      // CREATE WICKS
      CandleChartGroup.append("line") // now lets do the wicks of the candlesticks ** THE WICKS **
        .attr("x1", bar_width*i+margin.left)
        .attr("x2", bar_width*i+margin.left) //it's a vertical wick so same as above 
        .attr("y1", candlestick_max_height-(high[i]-lowest_wick)*scaler+margin.top) //top of wick 
        .attr("y2", candlestick_max_height-(low[i]-lowest_wick)*scaler+margin.top) //bottom of wick
        .style("stroke", bar_color)
        .style("stroke-width", "2")
        .style("fill", "none");


      // CREATE BODY
      CandleChartGroup.append("rect")  // candlesticks  *** CANDLE BODY *** 
        .attr("width", bar_width*.94) 
        .attr("height", candle_height*scaler) // calculated above 
        .attr("x", bar_width*(i-1)+(.5*bar_width)+margin.left) //x location so width of bar * iterator  
        .attr("y", candlestick_max_height-(candle_y_start-lowest_wick)*scaler+margin.top-candle_height*scaler) //y location
        .attr("rx", "3") // for the rounded corners   
        .attr("ry", "3") // for the rounded corners    
        .style("stroke", "black") // works 
        .style("stroke-width", 2) // works 
        .style("opacity", 1) // works 
        .style("fill", bar_color); //works and use "none" instead of false 
    

      // CREATE VOLUME BARS
      CandleChartGroup.append("rect")  //then let us do our ** VOLUME BARS **
        .attr("width", bar_width*.99) 
        .attr("height", bar_height) // calculated above 
        .attr("x", bar_width*(i-1)+(.5*bar_width)+margin.left) //x location so width of bar * iterator  
        .attr("y", vol_base-bar_height+margin.top) //y location
        .style("stroke", "black") // works 
        .style("stroke-width", 2) // works 
        .style("opacity", .6) // works 
        .style("fill", bar_color); //works and use "none" instead of false
      
    }


    // INITIAL INDICATOR LINES

    if (chosenIaxis === "bitfinex_shorts") {
      var ind_values = finex_shorts;
    }
    else if (chosenIaxis === "finex_leveraged_longs") {
      var ind_values = finex_leveraged_longs;
    }
    //else if (chosenIaxis === "finex_volume") {
    //  var ind_values = finex_volume;
    //}
    else if (chosenIaxis === "bitcoin_dominance") {
      var ind_values = bitcoin_dominance;
    }
   // else if (chosenIaxis === "rolling_20_d") {
    //  var ind_values = rolling_20_d;
    // }
    // else if (chosenIaxis === "bitmex_funding"){
    //   var ind_values = bitmex_funding;
    //};

    indicatorline = IndicatorChartGroup.selectAll("line");
        if(!indicatorline.empty()) {
          indicatorline.remove();
        }

    for (i = 1; i < volume.length; i++) {  // main loop to create each chart item 
      
      const max_i = d3.max(ind_values);
      const min_i = d3.min(ind_values);
      const i_scaler =(indicator_win_height)/(max_i-min_i); //scaler for indicator 1

      var iLinesGroup = IndicatorChartGroup.append("line") // ********************************LINE for indicator ONE  *********
        .data(selectdata)
        .style("stroke", "blue")
        .style("stroke-width", "2")
        .style("opacity", .4)
        .style("fill", "none");

      // updates circles with new x values
      iLinesGroup = renderLines(iLinesGroup, ind_values, bar_width, i, min_i, i_scaler);

      // updateToolTip function above csv import
      iLinesGroup = updateToolTip(selectdata, chosenIaxis, iLinesGroup, ind_values, i);

    }


    // INDICATOR LABELS

    // Create group for  3 i-axis labels 

    var ilabelsGroup = IndicatorChartGroup.append("g")
          .attr("transform", `translate(${indicator_win_width/2 + margin.left}, ${(candle_win_height + indicator_win_height + margin.top+15)})`)

    var indicator_1_label = ilabelsGroup.append("text")
      .attr("x", 0)         // set x position of left side of text
      .attr("y", 20) // set y position of bottom of text
      .attr("value", "bitfinex_shorts")
      .attr("text-anchor", "end")
      .style("font", "12px sans-serif")
      .classed("active", true)
      .text("BitFinex Short Contracts ($)");

    var indicator_2_label = ilabelsGroup.append("text")//indicator_2 axis right side
      .attr("x",0)         // set x position of left side of text
      .attr("y", 40) // set y position of bottom of text
      .attr("value", "finex_leveraged_longs")
      .attr("text-anchor", "end")
      .style("font", "12px sans-serif")
      .classed("inactive", true)
      .text("Longs");

    var indicator_3_label = ilabelsGroup.append("text")//indicator_2 axis right side
      .attr("x",0)         // set x position of left side of text
      .attr("y", 60) // set y position of bottom of text
      .attr("value", "finex_volume")
      .attr("text-anchor", "end")
      .style("font", "12px sans-serif")
      .classed("inactive", true)
      .text("TE");

    var indicator_4_label = ilabelsGroup.append("text")//indicator_2 axis right side
      .attr("x",0)         // set x position of left side of text
      .attr("y", 80) // set y position of bottom of text
      .attr("value", "bitcoin_dominance")
      .attr("text-anchor", "end")
      .style("font", "12px sans-serif")
      .classed("inactive", true)
      .text("Bitcoin Dominance (% of total cap)");

    var indicator_5_label = ilabelsGroup.append("text")//indicator_2 axis right side
      .attr("x",0)         // set x position of left side of text
      .attr("y", 100) // set y position of bottom of text
      .attr("value", "rolling_20_d")
      .attr("text-anchor", "end")
      .style("font", "12px sans-serif")
      .classed("inactive", true)
      .text("Rolling 20 day");

    // var indicator_6_label = ilabelsGroup.append("text")//indicator_2 axis right side
    //   .attr("x",0)         // set x position of left side of text
    //   .attr("y", 40) // set y position of bottom of text
    //   .attr("value", "bitmex_funding")
    //   .style("font", "12px sans-serif")
    //   .classed("inactive", true)
    //   .text("Bitmex funding");

    var Note1= ilabelsGroup.append("text")
      .attr("x", indicator_win_width/2 * 3/4)         // set x position of left side of text
      .attr("y", -(indicator_win_height + 1/3 *  candle_win_height) -45) // set y position of bottom of text
      .style("font", "12px sans-serif")
      .style("fill", "grey")
      .attr("text-anchor", "start")
      .classed("active", true)
      .text("NOTE: Green indicates that the");

    var Note2 = ilabelsGroup.append("text")
      .attr("x", indicator_win_width/2 * 3/4)         // set x position of left side of text
      .attr("y", -(indicator_win_height + 1/3 *  candle_win_height) - 30) // set y position of bottom of text
      .style("font", "12px sans-serif")
      .style("fill", "grey")
      .attr("text-anchor", "start")
      .classed("active", true)
      .text("close value for that date is higher");

    var Note3 = ilabelsGroup.append("text")
      .attr("x", indicator_win_width/2 * 3/4)         // set x position of left side of text
      .attr("y", -(indicator_win_height + 1/3 *  candle_win_height) - 15) // set y position of bottom of text
      .style("font", "12px sans-serif")
      .style("fill", "grey")
      .attr("text-anchor", "start")
      .classed("active", true)
      .text("than the close value for the previous day.");
      
    var Note4 = ilabelsGroup.append("text")
      .attr("x", indicator_win_width/2 * 3/4)         // set x position of left side of text
      .attr("y", -(indicator_win_height + 1/3 *  candle_win_height) - 0) // set y position of bottom of text
      .style("font", "12px sans-serif")
      .style("fill","grey")
      .attr("text-anchor", "start")
      .classed("active", true)
      .text("Red indicates the opposite.");


    // INDICATOR EVENT LISTENER
    ilabelsGroup.selectAll("text").on("click", function() {
      
      // get value of selection
      var valuei = d3.select(this).attr("value");
      
      if (valuei !== chosenIaxis) {

        // replaces chosenIaxis with new value
        chosenIaxis = valuei;
        
        // CREATE INDICATOR Y-AXIS

        // set y-scale for indicator by calling indicator scale function "iScale"
        iLinearScale = iScale(selectdata, chosenIaxis, indicator_win_height);

        // set y-axis for indicator by calling indicator axis function "renderaxis"
        iAxis = renderIaxis(iLinearScale, iAxis);

        // INDICATOR LINES ON CLICK

        // remove existing indicator line
        indicatorline = IndicatorChartGroup.selectAll("line");
            if(!indicatorline.empty()) {
              indicatorline.remove();
            }

        // set values for lines
        if (chosenIaxis === "bitfinex_shorts") {
          var ind_values = finex_shorts;
        }

        else if (chosenIaxis === "finex_leveraged_longs") {
          var ind_values = finex_leveraged_longs;
        }

        else if (chosenIaxis === "finex_volume") {
          var ind_values = finex_volume;
        }

        else if (chosenIaxis === "bitcoin_dominance") {
          var ind_values = bitcoin_dominance;
        }

        else if (chosenIaxis === "rolling_20_d") {
          var ind_values = rolling_20_d;
        }

        else if (chosenIaxis === "bitmex_funding") {
          var ind_values = bitmex_funding;
        };

        // loop for creating indicator lines
        for (i = 1; i < volume.length; i++) { //change from volume.length in future  
          
          const max_i = d3.max(ind_values);
          const min_i = d3.min(ind_values);
          const i_scaler =(indicator_win_height)/(max_i-min_i); //scaler for indicator 1
    
          var iLinesGroup = IndicatorChartGroup.append("line") // ********************************LINE for indicator ONE  *********
            .data(selectdata)  
            .style("stroke", "blue")
            .style("stroke-width", "2")
            .style("opacity", .4)
            .style("fill", "none");
    
          // updates circles with new x values
          iLinesGroup = renderLines(iLinesGroup, ind_values, bar_width, i, min_i, i_scaler);

          // updateToolTip function above csv import
          iLinesGroup = updateToolTip(selectdata, chosenIaxis, iLinesGroup, ind_values, i);

        }

        // changes classes to change bold text
        if (chosenIaxis === "bitfinex_shorts") {
        indicator_1_label
            .classed("active", true)
            .classed("inactive", false);
        indicator_2_label
            .classed("active", false)
            .classed("inactive", true);
        indicator_3_label
            .classed("active", false)
            .classed("inactive", true);
        indicator_4_label
            .classed("active", false)
            .classed("inactive", true);
        indicator_5_label
            .classed("active", false)
            .classed("inactive", true);
        // indicator_6_label
        //     .classed("active", false)
        //     .classed("inactive", true);
        }
        else if (chosenIaxis === "finex_leveraged_longs"){
        indicator_2_label
          .classed("active", true)
          .classed("inactive", false);
        indicator_1_label
          .classed("active", false)
          .classed("inactive", true);
        indicator_3_label
          .classed("active", false)
          .classed("inactive", true);
        indicator_4_label
          .classed("active", false)
          .classed("inactive", true);
        indicator_5_label
          .classed("active", false)
          .classed("inactive", true);
        // indicator_6_label
        //   .classed("active", false)
        //   .classed("inactive", true);
        }
        else if (chosenIaxis === "finex_volume"){
        indicator_3_label
          .classed("active", true)
          .classed("inactive", false);
        indicator_1_label
          .classed("active", false)
          .classed("inactive", true);
        indicator_2_label
          .classed("active", false)
          .classed("inactive", true);
        indicator_4_label
          .classed("active", false)
          .classed("inactive", true);
        indicator_5_label
          .classed("active", false)
          .classed("inactive", true);
        // indicator_6_label
        //   .classed("active", false)
        //   .classed("inactive", true);
        }
        else if (chosenIaxis === "bitcoin_dominance"){
        indicator_4_label
          .classed("active", true)
          .classed("inactive", false);
        indicator_1_label
          .classed("active", false)
          .classed("inactive", true);
        indicator_2_label
          .classed("active", false)
          .classed("inactive", true);
        indicator_3_label
          .classed("active", false)
          .classed("inactive", true);
        indicator_5_label
          .classed("active", false)
          .classed("inactive", true);
        // indicator_6_label
        //   .classed("active", false)
        //   .classed("inactive", true);
        }
        else if (chosenIaxis === "rolling_20_d"){
        indicator_5_label
          .classed("active", true)
          .classed("inactive", false);
        indicator_1_label
          .classed("active", false)
          .classed("inactive", true);
        indicator_2_label
          .classed("active", false)
          .classed("inactive", true);
        indicator_3_label
          .classed("active", false)
          .classed("inactive", true);
        indicator_4_label
          .classed("active", false)
          .classed("inactive", true);
        // indicator_6_label
        //   .classed("active", false)
        //   .classed("inactive", true);
        }
        // else if (chosenIaxis === "bitmex_funding"){
        // indicator_6_label
        //   .classed("active", true)
        //   .classed("inactive", false);
        // indicator_1_label
        //   .classed("active", false)
        //   .classed("inactive", true);
        // indicator_2_label
        //   .classed("active", false)
        //   .classed("inactive", true);
        // indicator_3_label
        //   .classed("active", false)
        //   .classed("inactive", true);
        // indicator_4_label
        //   .classed("active", false)
        //   .classed("inactive", true);
        // indicator_5_label
        //   .classed("active", false)
        //   .classed("inactive", true);
        // }
      }}) //these brackets all look right to me ie match with my code but there is some error
  })
}; 
console.log("right before slider event loop");
$("#slider").bind("valuesChanged", function(e, data){ //this is the date slider main loop - tried "valuesChanged" but waaay slow 
  // all the logic here after the arrays generated, closing bracket at bottom
  console.log("inside slider value change: data.values:"+ data.values + "data.values.min:" +data.values.min + " and max: " + data.values.max); //data is an object 
//  var d = new Date(dateString);  //I think the data.values.min is in datestring format, need to 
start_date=new Date(data.values.min);
end_date=new Date(data.values.max);
var new_date_parse= d3.timeFormat("%Y%m%%d");
start_date=new_date_parse(start_date); 
end_date=new_date_parse(end_date);
//console.log("***new START DATE", start_date,"start date typeof", typeof(start_date), "END date", end_date,"end type:", typeof(end_date)); 
makeResponsive();
}); // this is from slider code 
 
makeResponsive();
// When the browser window is resized, makeResponsive() is called.
d3.select(window).on("resize", makeResponsive);
//console.log("gets to the very end ");
