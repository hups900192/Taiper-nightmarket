/*-------------設定變數--------------*/
var data1s = [];
var data2s = [];
var areadata = [];
var marketdata = [];

/*-------------指定DOM元素------------*/
var area = document.querySelector('.night-marcket-area');
var nightmarket = document.querySelector('.night-market');
var marketarea = document.getElementsByClassName('area');
var chkbx = document.getElementsByClassName('chkbx');
var createchart = document.querySelector('.createchart');

/*---------------AJAX-----------------*/
var xhr = new XMLHttpRequest();
xhr.open('get','https://data.taipei/api/getDatasetInfo/downloadResource?id=8a569b5b-0cb1-4c7f-a064-780b3301354c&rid=9744ea1c-aafb-471c-8bb8-04f398ad415a',false);
xhr.send(null);
var x = xhr.response;
data1s = JSON.parse(x);

xhr.open('get','https://data.taipei/api/getDatasetInfo/downloadResource?id=8a569b5b-0cb1-4c7f-a064-780b3301354c&rid=da4a214f-0c3d-437e-9312-34e5671db2a8',false);
xhr.send(null);
var y = xhr.response;
data2s = JSON.parse(y);

/*-------------執行function---------------*/
classifydata1s();
updatearea();
classifydata2s();
updatenightmarket();


/*---------------綁定監聽-----------------*/
for(var i =0;i<marketarea.length;i++){
	marketarea[i].addEventListener('click',openlist);
}
createchart.addEventListener('click',createchart1);



/*---------------定位夜市選單-----------------*/
function openlist(){
	for(var i=0;i<marketarea.length;i++){
		if(this.innerHTML==marketarea[i].innerHTML){
			var c=document.getElementById('night-market'+i);
			if(c.style.height=="0px"){
				c.style.height="200px";
			}
			else{
				c.style.height="0px";				
				var d=c.getElementsByTagName("input");
				for(var j=0;j<d.length;j++){
				  d[j].checked=false;
				}
			}
		break;
		}
	}
}



/*---------------Button(比對夜市)-----------------*/
/*--產生符合Chartbar API陣列、參數--*/
function createchart1(){
	marketdata.length=0;
	marketdata.push(['夜市名稱', '攤販數量']);
	for(var i= 0;i<chkbx.length;i++){
		if(chkbx[i].checked){
			var id1 = parseInt(chkbx[i].id/10000);
			var id2 = chkbx[i].id%10000;
			marketdata.push([areadata[id1].夜市資料[id2].夜市名稱,0]);		
		}			
	}
	if(marketdata.length == 1){
		alert("尚未指定夜市");
		return;
	}
	for(var j=1;j<marketdata.length;j++){
				var num = 0;
				for( var k = 0;k<data2s.length;k++){
				if(marketdata[j][0] == data2s[k].夜市名稱){
					num++;
					marketdata[j][1] = num;
				}
				}
	}
	var close = document.querySelector('.taipeimap');
	close.style.height = "0px";
	var openchartbar=document.querySelector('.chartbar-content');
	openchartbar.style.display = "block";
	var barwidth = 0
	if(marketdata.length-1< 6){
	barwidth=200+(marketdata.length-2)*150;
	}
	else if(marketdata.length-1<10){
		barwidth=200+(marketdata.length-2)*130;
	}
	else{
		barwidth=200+(marketdata.length-2)*100;
	}

	
/*--GOOGLE Chartba API--*/
 google.charts.load('current', {'packages':['corechart', 'bar']});
 google.charts.setOnLoadCallback(drawStuff);
      function drawStuff() {
        var button = document.getElementById('change-chart');
        var chartDiv = document.getElementById('chart_div1');
        var data = google.visualization.arrayToDataTable(marketdata);
        var materialOptions = {
          width: barwidth,
          chart: {
            title: '夜市攤販統計圖',
            subtitle: '比對勾選比較的夜市攤販數量'
          },
          series: {
            0: { axis: '攤販數量' }, // Bind series 0 to an axis named 'distance'.
            1: { axis: 'brightness' } // Bind series 1 to an axis named 'brightness'.
          },
          axes: {
            y: {
              distance: {label: 'parsecs'}, // Left y-axis.
              brightness: {side: 'right', label: 'apparent magnitude'} // Right y-axis.
            }
          }
        };
        var classicOptions = {
          width: barwidth,
          series: {
            0: {targetAxisIndex: 0},
            1: {targetAxisIndex: 1}
          },
          title: '夜市攤販統計圖',
          vAxes: {
            // Adds titles to each axis.
            0: {title: '攤販數量'},
            1: {title: 'apparent magnitude'}
          }
        };
        function drawMaterialChart() {
          var materialChart = new google.charts.Bar(chartDiv);
          materialChart.draw(data, google.charts.Bar.convertOptions(materialOptions));
          button.innerText = 'Change to Classic';
          button.onclick = drawClassicChart;
        }
        function drawClassicChart() {
          var classicChart = new google.visualization.ColumnChart(chartDiv);
          classicChart.draw(data, classicOptions);
          button.innerText = 'Change to Material';
          button.onclick = drawMaterialChart;
        }
        drawMaterialChart();
    };
}


/*---------------分析data1sJSON資料後存取於陣列-----------------*/
function classifydata1s(){
	var a = "";
	outfor:
	for(var i=0;i<data1s.length;i++){
			if (data1s[i].所在位置.substr(2,1)=="區") {
				a=(data1s[i].所在位置.substr(0,3));
				for(j=0 ; j<areadata.length;j++){
					if(a==areadata[j].行政區){
						areadata[j].夜市資料.push({夜市名稱:data1s[i].夜市名稱,攤位資料:[]})
							continue outfor;
					}
				}
				areadata.push({行政區:a,夜市資料:[{夜市名稱:data1s[i].夜市名稱,攤位資料:[]}]});		
			}
	}
}

/*---------------分析data2sJSON資料後存取於陣列-----------------*/
function classifydata2s(){
	for(var i=0;i<data2s.length;i++){
		for(var j=0;j<areadata.length;j++){
			for(var k=0;k<areadata[j].夜市資料.length;k++){
				if(data2s[i].夜市名稱==areadata[j].夜市資料[k].夜市名稱){
					areadata[j].夜市資料[k].攤位資料.push(data2s[i]);		
				}
			}	
		}
	}
}

/*---------------產生行政區button-----------------*/
function updatearea(){
	var str="";
	for(var i=0;i<areadata.length;i++){
		str +='<li class="area" id="area'+i+'">'+areadata[i].行政區+'</li>';
	}
	area.innerHTML=str;
}

/*---------------產生各行政區對應夜市--------------*/
function updatenightmarket(){
	var l = 0;
	var h = 0;
	var str = "";
	for(var i=0;i<areadata.length;i++){
			l = marketarea[i].offsetLeft-10;
			h = marketarea[i].offsetTop+marketarea[i].clientHeight+20;
		    str += '<div class="night-market'+i+'" id="night-market'+i+'"style="position: absolute;top:'+h+'px;left:'+l+'px;height:0px"> ';
	 		str += '<ul class="market'+i+'" id="market'+i+'">';
	for(var j=0;j<areadata[i].夜市資料.length;j++){
		str +='<li id="'+(i*10000+j)+'"><input type="checkbox" class="chkbx" id="'+(i*10000+j)+'">'+areadata[i].夜市資料[j].夜市名稱+'</li>'
	}
	str += '</ul> </div>';
	}
	nightmarket.innerHTML=str;
}


/*---------------GOOGLE 圓餅圖API--------------*/

// Load the Visualization API and the corechart package.
google.charts.load('current', {'packages':['corechart']});
// Set a callback to run when the Google Visualization API is loaded.
google.charts.setOnLoadCallback(drawChart);
      // Callback that creates and populates a data table,
      // instantiates the pie chart, passes in the data and
      // draws it.
  function drawChart() {
    // Create the data table.
    var data = new google.visualization.DataTable();
    data.addColumn('string', 'Topping');
    data.addColumn('number', 'Slices');
    var piechartlist=[];
    for(var i=0;i<areadata.length;i++){
        piechartlist.push([areadata[i].行政區,areadata[i].夜市資料.length]);
     }
    data.addRows(piechartlist);
    // Set chart options
    var options = {'title':'台北市行政區夜市占比',
                   'width':500,
                   'height':400};
    // Instantiate and draw our chart, passing in some options.
    var chart = new google.visualization.PieChart(document.getElementById('chart_div'));
        chart.draw(data, options);
 }








 

