// Sachin Shah September 2019

"use strict";

const fps = 100;

class Bar extends c
{
	render(){
		const rect = e("rect", {
			x : this.props.x,
			y : this.props.y,
			width : this.props.width,
			height : this.props.height,
			className : "Bar",
			style : {
				fill : this.props.display ? "#de4e4e" : "#5858f5",
				opacity : this.props.hold ? ".5" : "1",
			}
		});

		return rect;
	}
}

class Visualization extends c
{
	render(){
		const svg = e("svg",{
			className : "Visualization"
		},...this.props.shapes);
		return svg;
	}
}

class Sorter
{
	constructor(onIndex, onHold, setArray, rangeIndex){
		this.onIndex = (i)=> onIndex(i);
		this.hold = (i) => onHold(i);
		this.setArray = (arr)=> setArray(arr);
		this.multipleIndex = (arr)=>rangeIndex(arr);

		this.canSort = true;
	}

	delay(ms){
		return new Promise(resolve => setTimeout(resolve, ms));
	}

	switch(arr, i, j){
		const temp = arr[i];
		arr[i] = arr[j];
		arr[j] = temp;
		return temp;
	}

	swap(arr, i){
		return this.switch(arr, i, i+1);
	}

	async bubble(arr){
		if (this.canSort){
			this.canSort = false;
			var swapped = true;
			while (swapped){
				swapped = false;
				for (let i = 0; i < arr.length; i++){
					this.onIndex(i);
					if (i == arr.length){
						break;
					}
					if (arr[i] > arr[i+1]){
						this.swap(arr, i);
						swapped = true;
					}
					await this.delay(fps);
				}
			}
			this.onIndex(-1);
			this.canSort = true;
		}
	}

	async insertion(arr){
		if (this.canSort){
			this.canSort = false;
			for (let i = 1; i < arr.length; i++){
				for (let j = i; j >= 0; j--){
					this.onIndex(j);
					if (j == 0){
						break;
					}
					if (arr[j] < arr[j-1]){
						this.swap(arr, j-1);
					} else {
						break;
					}
					await this.delay(fps);
				}
			}
			this.onIndex(-1);
			this.canSort = true;
		}
	}

	async selection(arr){
		if (this.canSort){
			this.canSort = false;
			var min = arr[0];
			var index = 0;

			for (let i = 0; i < arr.length-1; i++){
				for (let j = arr.length-1; j > i; j--){
					this.onIndex(j);
					this.hold(index);
					if (min > arr[j]){
						min = arr[j];
						index = j;
					}
					await this.delay(fps);
				}
				this.switch(arr, i, index);
				index = i+1;
				min = arr[i+1];
			}
			this.onIndex(-1);
			this.hold(-1);
			this.canSort = true;
		}
	}

	compress(arr){
		return arr.join().split(',').map(num=>parseInt(num));
	}

	getArray(partial, full){
		var temp = this.compress(partial.map(x=>x));
		var temp2 = this.compress(full.map(x=>x)).splice(temp.length);

		if (temp2 !== undefined){
			temp = temp.concat(temp2);
		}
		//console.log(temp);
		this.setArray(temp);
	}

	range(size, start){
		return Array(size).fill().map((num,i)=>i+start);
	}

	async merge(arr){
		if (this.canSort){
			this.canSort = false;
			var output = arr.map(num => [num]);

			while (output.length > 1) {
				const isOdd = output.length % 2 !== 0;
				var temp = [];

				for (let i = 0; i < output.length; i += 2) {
					var left = output[i];
					var right = output[i + 1];
					if (isOdd && i === (output.length - 3)) {
						right = this.mergeSort(right, output[i + 2]);
						i++;
						this.multipleIndex(this.range(output[i].length, i*output[i].length));
						await this.delay(fps);
					}
					temp.push(this.mergeSort(left, right));
					this.multipleIndex(this.range(output[i].length, i*output[i].length));
					await this.delay(fps);
					this.getArray(temp, output);
				}
				output = temp;
			}
			this.setArray(this.compress(output));
			
			this.onIndex(-1);
			this.canSort = true;
		}
	}

	mergeSort(left, right){
		const merged = [];
		var i = 0;
		var j = 0;

		while (merged.length !== (left.length + right.length)) {
			if (right[j] === undefined || left[i] <= right[j]) {
				merged.push(left[i]);
				i++;
			} else if (left[i] === undefined || left[i] > right[j]) {
				merged.push(right[j]);
				j++;
			}
		}
		return merged;
	}

	partition(arr, low, high){
		var i = (low - 1);
		var pivot = arr[high]; 
		
		for (let j = low; j < high; j++){
			if (arr[j] <= pivot) { 
				i++;
				var temp = arr[i];
				arr[i] = arr[j];
				arr[j] = temp;
			}
		}
	  
		var temp = arr[i + 1];
		arr[i + 1] = arr[high];
		arr[high] = temp;
		return (i + 1);
	}
	
	async quick(arr){
		if (this.canSort){
			this.canSort = false;
			var l = 0;
			var h = arr.length-1;

			var size = h - l + 1;
			var stack = Array(size).fill().map((num,i)=>0);

			var top = -1;

			top++;
			stack[top] = l;
			top++;
			stack[top] = h;

			while (top >= 0){
				h = stack[top];
				top--;
				l = stack[top];
				top--;

				var p = this.partition(arr, l, h);

				if (p-1 > l) {
					top++;
					stack[top] = l;
					top++;
					stack[top] = p - 1;
				}

				if (p+1 < h){
					top++;
					stack[top] = p + 1;
					top++;
					stack[top] = h;
				}

				this.multipleIndex([l, h]);
				await this.delay(fps);
			}

			this.onIndex(-1);

			this.canSort = true;
		}
	}
}

class Main extends c
{
	constructor(props){
		super(props);
		this.state = {
			max : 500,
			max_width : window.innerWidth-30,
			items : 10,
			array : [],
			index : [-1],
			hold : -1,
			sorter : new Sorter(
				(i)=>this.setState({index : [i]}),
				(i)=>this.setState({hold : i}),
				(arr)=>this.setState({array : arr}),
				(arr)=>this.setState({index : arr})
				)
		};
		this.updateWindowDimensions = this.updateWindowDimensions.bind(this);
	}

	componentDidMount(){
		this.setState({
			array : this.generateArray(this.state.items),
		});
		window.addEventListener('resize', this.updateWindowDimensions);
	}

	updateWindowDimensions() {
		this.setState({max_width : window.innerWidth-30});
	}

	componentWillUnmount() {
		window.removeEventListener('resize', this.updateWindowDimensions);
	}

	getRandomValue(max){
		return Math.ceil(Math.random()*max);
	}

	generateArray(num){
		var arr = [];
		for (let i = 0; i < num; i++){
			arr.push(this.getRandomValue(this.state.max));
		}
		return arr;
	}

	itemField(e){
		this.setState({
			items : e.target.value,
			array : this.generateArray(e.target.value)
		});
	}

	render(){
		const {max, items, array, sorter, index, hold, max_width}= {...this.state};

		const title = e("h1", null, "Sorting Visualization");

		const noi = e("span", null, "Number of Items: ");

		const size = e("input", {
			type : "number",
			min : "2",
			max : "500",
			placeholder : "10",
			onChange : (e)=> this.itemField(e)
		});

		const generate_button = e("button", {
			onClick : ()=>this.setState({array : this.generateArray(this.state.items)}),
		}, "New Array");

		const bubble_button = e("button", {
			onClick : ()=> sorter.bubble(array)
		}, "Bubble");

		const ibutton = e("button", {
			onClick : ()=> sorter.insertion(array)
		}, "Insertion");

		const sbutton = e("button", {
			onClick : ()=> sorter.selection(array)
		}, "Selection");

		const mbutton = e("button", {
			onClick : ()=> sorter.merge(array)
		}, "Merge");

		const qbutton = e("button", {
			onClick : ()=> sorter.quick(array)
		}, "Quick");

		const shapes = array.map((val,i)=>{
			return e(Bar, {x : (i) * ((max_width)/(items)), y : max - val, width : ((max_width*.99)/(items)), height : val, display : index.includes(i), hold : i == hold});
		});

		const svg = e(Visualization, {
			shapes : shapes
		});

		const content = e("div", {style : {textAlign : "center"}}, title, noi, size, generate_button, bubble_button, ibutton, sbutton, mbutton, qbutton, svg);
		return content;
	}
}

function run(){
	const element = e(Main, null);
	ReactDOM.render(element, document.getElementById('root'));
}