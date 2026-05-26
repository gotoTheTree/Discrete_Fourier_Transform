console.log('input:fx.js');
var fx_Type=0;
let fx_Quantity=1;


function add_input_Table (self){
    if(fx_Quantity<=4){
    fx_Quantity+=1;
    let table = self.parentNode.parentNode.parentNode;
    let newrow = table.insertRow(table.rows.length);
    let fx_data = newrow.insertCell(0);
    let fx_min_data = newrow.insertCell(1);
    let fx_max_data = newrow.insertCell(2);
    let fx_ed_data = newrow.insertCell(3);
    fx_data.innerHTML = '<td><input class="f_text" type="text""></td>';
    fx_min_data.innerHTML = '<td><input class="f_min" type="number" value="0"></td>';
    fx_max_data.innerHTML = '<td><input class="f_max" type="number" value="6.28"></td>';
    fx_ed_data.innerHTML = '<td><button onclick="fx_bool_Fun(this)">启用</button><button onclick="fx_del_Fun(this)">删除</button></td>';
    }
}

var input_Draw_tpye=0;
function bu_val_sumDraw_fun(self){
    if(self.innerHTML=="结果合"){
        input_Draw_tpye=1;
        self.innerHTML="分离"
    }else{
        self.innerHTML="结果合";
        input_Draw_tpye=0;
    }
}

function fx_bool_Fun(self){
    if(self.innerHTML=="启用"){
        self.innerHTML="禁用"
    }else{
        self.innerHTML="启用";
    }
}

function fx_del_Fun(self){
    fx_Quantity-=1;
    let row = self.parentNode.parentNode;
    row.parentNode.removeChild(row);
}

function Text_To_fx_Type(fx_data){
    if(fx_data[0]=='x'&&fx_data[1]=='='){
        return "Y_Line";
    }else if(fx_data[0]=='y'&&fx_data[1]=='='){
        return "X_Line";
    }else if(fx_data!=''){
        return "Standard";
    }else{
        return "NULL";
    }
}

class FX_class {
    max = 0;
    min = 0;
    step = 1;
    fx_Type = 'Standard';
    fx_js;
    constructor(MAX,MIN,Step,fx_data){
        if(MAX>MIN){
            this.max = MAX;
            this.min = MIN;
        }else{
            this.max = MIN;
            this.min = MAX;
        }
        this.step = Step;
        this.fx_Type = Text_To_fx_Type(fx_data);
        if(this.fx_Type=='Standard'){
            this.fx_js = Text_To_JSFunction(fx_data);
        }else if(this.fx_Type=='X_Line'||this.fx_Type=='Y_Line'){
            const val = Number(fx_data.split('=')[1].trim());
            this.fx_js = val;
        }
    };
}

function Text_To_JSFunction(expr) {
  // 预处理表达式（可选）
  let processed = expr
    .replace(/exp/,'Math.exp')
    .replace(/e\^/,'Math.exp')
    .replace(/\^/g, '**')               // 数学幂 → JS 指数
    .replace(/sin/g, 'Math.sin')
    .replace(/cos/g, 'Math.cos')
    .replace(/sqrt/g, 'Math.sqrt')
    .replace(/abs/g, 'Math.abs')
    .replace(/log/g, 'Math.log')
    .replace(/PI/gi, 'Math.PI');
    
  return new Function('x', `return ${processed};`);
}

function input_fx_List_Draw(){
    let table = document.getElementById('table_fx_');
    
    if(fx_Type==0){
        // 时域
        let canvas = document.getElementById('input_fx_canvas');
        canvas_UpScreen(canvas);
        fx_Draw_Axis(canvas);
        if(input_Draw_tpye==0){
            //分离
            for (var i = 1, row; row = table.rows[i]; i++) {
                if(row.cells[3].children[0].innerHTML=='禁用'){
                    let data = row.cells[0].children[0].value
                    let min = Number(row.cells[1].children[0].value);
                    let max = Number(row.cells[2].children[0].value);
                    let fx_data = new FX_class(max,min,0.01,data);
                    fx_input_Separate_Draw_Line(fx_data,10,10,canvas);
                }
            }
            
        }else{
            //结果合
            let fx_datas = [];
            let start_val,end_val,min_step;
            for (var i = 1, row; row = table.rows[i]; i++) {
                if(row.cells[3].children[0].innerHTML=='禁用'){
                    let data = row.cells[0].children[0].value
                    let min = Number(row.cells[1].children[0].value);
                    let max = Number(row.cells[2].children[0].value);
                    fx_datas.push(new FX_class(max,min,0.01,data));
                }
            }
            if(fx_datas.length!=0){
                start_val = fx_datas[0].min;
                end_val = fx_datas[0].max;
                min_step = fx_datas[0].step;
                for (let i = 0; i < fx_datas.length; i++) {
                    if(fx_datas[i].fx_Type=='Y_Line'){
                        if(fx_datas[i].fx_js<start_val){
                            start_val = fx_datas[i].fx_js;
                        }else if(fx_datas[i].fx_js>end_val){
                            end_val = fx_datas[i].fx_js;
                        }
                    }else{
                        if(fx_datas[i].min<start_val){
                            start_val = fx_datas[i].min
                        }
                        if(fx_datas[i].max>end_val){
                            end_val = fx_datas[i].max;
                        }
                    }
                    if(fx_datas[i].step<min_step){
                        min_step = fx_datas[i].step;
                    }
                }
                fx_input_Sum_Draw_Line(fx_datas,start_val,end_val,min_step,10,10,canvas);
            }
        }
    }else{
        // 频域
        

    }
}

function fx_Draw_Axis(canvas){
    let context = canvas.getContext("2d");
    context.save();
    context.beginPath();
    context.moveTo(0,canvas.offsetHeight/2);
    context.lineTo(canvas.offsetWidth,canvas.offsetHeight/2);
    context.moveTo(canvas.offsetWidth/2,0);
    context.lineTo(canvas.offsetWidth/2,canvas.offsetHeight);
    context.stroke();
    context.closePath();
    context.restore();
}

function x_add(x,step){
    let val = x+step;
    if(val>(-step)&&val<step){
        val = step;
    }
    return val;
}

function fx_input_Sum_Draw_Line(fx_datas,start_val,end_val,step,ZoomX,ZoomY,canvas){
    let x = start_val;
    let fx_val=0;
    let context = canvas.getContext("2d");
    context.save();
    context.translate(canvas.offsetWidth/2,canvas.offsetHeight/2);
    context.scale(1,-1);
    context.beginPath();
    for (let i = 0; i < fx_datas.length; i++) {
        if(fx_datas[i].fx_Type=='Standard'){
            if(x>=fx_datas[i].min && x<=fx_datas[i].max){
                fx_val+=fx_datas[i].fx_js(x);
            }
        }else if(fx_datas[i].fx_Type=='X_Line'){
            if(x>=fx_datas[i].min && x<=fx_datas[i].max){
                fx_val+=fx_datas[i].fx_js;
            }
        }else if(fx_datas[i].fx_Type=='Y_Line'){
            //未定义
            if(x==fx_datas[i].fx_js){
                fx_val = canvas.offsetHeight/2/ZoomY;
                break;
            }
        }
    }
    context.moveTo(ZoomX*x,ZoomY*fx_val);
    while (x<=end_val) {
        x=x_add(x,step);
        if(x<=end_val){
            fx_val=0;
            for (let i = 0; i < fx_datas.length; i++) {
                if(fx_datas[i].fx_Type=='Standard'){
                    if(x>=fx_datas[i].min&&x<=fx_datas[i].max){
                        fx_val+=fx_datas[i].fx_js(x);
                    }
                }else if(fx_datas[i].fx_Type=='X_Line'){
                    if(x>=fx_datas[i].min&&x<=fx_datas[i].max){
                        fx_val+=fx_datas[i].fx_js;
                    }
                }else if(fx_datas[i].fx_Type=='Y_Line'){
                    //未定义
                    if(Math.abs(x-fx_datas[i].fx_js)<step){
                        fx_val = canvas.offsetHeight/2/ZoomY;
                        break;                                            
                    }
                }
            }
        context.lineTo(ZoomX*x,ZoomY*fx_val);
        }
    }
    context.stroke();
    context.closePath();
    context.restore();
}

function fx_input_Separate_Draw_Line(fx_data,ZoomX,ZoomY,canvas){
    let context = canvas.getContext("2d");
    context.save();
    context.translate(canvas.offsetWidth/2,canvas.offsetHeight/2);
    context.scale(1, -1);
    context.beginPath();
    if(fx_data.fx_Type=='Standard'){
        let x = fx_data.min;
        context.moveTo(ZoomX*x,ZoomY*fx_data.fx_js(x));
        while(x<=fx_data.max){
            x=x_add(x,fx_data.step);
            context.lineTo(ZoomX*x,ZoomY*fx_data.fx_js(x));
        }
    }else if(fx_data.fx_Type=='X_Line'){
        context.moveTo(ZoomX*fx_data.min,ZoomY*fx_data.fx_js);
        context.lineTo(ZoomX*fx_data.max,ZoomY*fx_data.fx_js);
    }else if(fx_data.fx_Type=='Y_Line'){
        context.moveTo(ZoomX*fx_data.fx_js,fx_data.min);
        context.lineTo(ZoomX*fx_data.fx_js,ZoomY*fx_data.max);
    }
    context.stroke();
    context.closePath();
    context.restore();
}

function input_ex_List_Draw(){
    let table = document.getElementById('table_fx_');
    let canvas = document.getElementById('MP_fx_canvas');
    canvas_UpScreen(canvas);
    fx_Draw_Axis(canvas);
    if(fx_Type==0){
        // 时域
        val =  document.getElementById('text_val');
        val2 =  document.getElementById('text2_val');
        val3 =  document.getElementById('text3_val');
        End_frequency = Number(val2.value)+Number(val.value)/100*(Number(val3.value)-Number(val2.value));
        if(input_Draw_tpye==0){
            //分离
            for (var i = 1, row; row = table.rows[i]; i++) {
                if(row.cells[3].children[0].innerHTML=='禁用'){
                    let data = row.cells[0].children[0].value
                    let min = Number(row.cells[1].children[0].value);
                    let max = Number(row.cells[2].children[0].value);
                    let fx_data = new FX_class(max,min,0.01,data);
                    fex_Separate_Draw_Line(fx_data,End_frequency,25,25,canvas);
                }
            }
        }else{
            //结果合
            let fx_datas = [];
            let start_val,end_val,min_step;
            for (var i = 1, row; row = table.rows[i]; i++) {
                if(row.cells[3].children[0].innerHTML=='禁用'){
                    let data = row.cells[0].children[0].value
                    let min = Number(row.cells[1].children[0].value);
                    let max = Number(row.cells[2].children[0].value);
                    fx_datas.push(new FX_class(max,min,0.01,data));
                }
            }
            if(fx_datas.length!=0){
                start_val = fx_datas[0].min;
                end_val = fx_datas[0].max;
                min_step = fx_datas[0].step;
                for (let i = 0; i < fx_datas.length; i++) {
                    if(fx_datas[i].fx_Type=='Y_Line'){
                        if(fx_datas[i].fx_js<start_val){
                            start_val = fx_datas[i].fx_js;
                        }else if(fx_datas[i].fx_js>end_val){
                            end_val = fx_datas[i].fx_js;
                        }
                    }else{
                        if(fx_datas[i].min<start_val){
                            start_val = fx_datas[i].min
                        }
                        if(fx_datas[i].max>end_val){
                            end_val = fx_datas[i].max;
                        }
                    }
                    if(fx_datas[i].step<min_step){
                        min_step = fx_datas[i].step;
                    }
                }
                
                fex_input_Sum_Draw_Line(fx_datas,start_val,end_val,min_step,End_frequency,25,25,canvas);
            }
        }
    }else{
        // 频域
    }
}

function fex_input_Sum_Draw_Line(fx_datas,start_val,end_val,min_step,frequency,ZoomX,ZoomY,canvas){
    let t = start_val-min_step;
    frequency = -frequency;
    let fx_val,x,y;
    let context = canvas.getContext("2d");
    let t_s=0;
    context.save();
    context.translate(canvas.offsetWidth/2,canvas.offsetHeight/2);
    context.scale(1,-1);
    context.beginPath();
    while (1) {
        t += min_step;
        if(t>end_val)break;
        fx_val = 0;
        for (let i = 0; i < fx_datas.length; i++) {
            if(fx_datas[i].fx_Type=='Standard'){
                if(t>=fx_datas[i].min&&t<=fx_datas[i].max){
                    fx_val+=fx_datas[i].fx_js(t);
                }
            }
        }
        x = fx_val*Math.cos(t*frequency);
        y = fx_val*Math.sin(t*frequency);
        if(t_s==0){
            t_s=1;
            context.moveTo(x*ZoomX,y*ZoomY);
        }else{
            context.lineTo(x*ZoomX,y*ZoomY);
        }
    }
    context.stroke();
    context.closePath();
    context.restore();
}

function fex_Separate_Draw_Line(fx_data,frequency,ZoomX,ZoomY,canvas){
    frequency = -frequency;
    if(fx_data.fx_Type=='Standard'){
        let context = canvas.getContext("2d");
        context.save();
        context.translate(canvas.offsetWidth/2,canvas.offsetHeight/2);
        context.scale(1,-1);
        context.beginPath();
        let t = fx_data.min-fx_data.step;
        let fx_val,x,y;
        let t_s = 0;
        while (1) {
            t+=fx_data.step;
            if(t>fx_data.max){
            break;
            }
            fx_val = fx_data.fx_js(t);
            x = fx_val*Math.cos(t*frequency);
            y = fx_val*Math.sin(t*frequency);
           
            if(t_s==0){
                t_s=1;
                context.moveTo(x*ZoomX,y*ZoomY);
            }else{
                context.lineTo(x*ZoomX,y*ZoomY);
            }
        }
        context.stroke();
        context.closePath();
        context.restore();
    }else if(fx_data.fx_Type=='X_Line'){
        let context = canvas.getContext("2d");
        context.save();
        context.translate(canvas.offsetWidth/2,canvas.offsetHeight/2);
        context.scale(1,-1);
        context.beginPath();
        let t = fx_data.min;
        let fx_val,x,y;
        fx_val = fx_data.fx_js;
        x = fx_val*Math.cos(t*frequency);
        y = fx_val*Math.sin(t*frequency);
        context.moveTo(x*ZoomX,y*ZoomY);
        while (1) {
            t+=fx_data.step;
            if(t>fx_data.max){
            break;
            }
            fx_val = fx_data.fx_js;
            x = fx_val*Math.cos(t*frequency);
            y = fx_val*Math.sin(t*frequency);
            context.lineTo(x*ZoomX,y*ZoomY);
        }
        context.stroke();
        context.closePath();
        context.restore();
    }
    else{
    }
}

function fex_points(fx_data,f){
    let t = fx_data.min-fx_data.step;
    let fx_val,x=0,y=0;
    if(fx_data.fx_Type == 'Standard'){
        while(1){
            t+=fx_data.step;
            if(t>fx_data.max)break;
            fx_val = fx_data.fx_js(t);
            x += fx_val*Math.cos(t*f);
            y += fx_val*Math.sin(t*f);
        }
    }else if(fx_data.fx_Type == 'X_Line'){
         while(1){
            t+=fx_data.step;
            if(t>fx_data.max)break;
            fx_val = fx_data.fx_js;
            x += fx_val*Math.cos(t*f);
            y += fx_val*Math.sin(t*f);
        }
    }
    let n = (fx_data.max-fx_data.min)/fx_data.step;
    x = x/n;
    y = y/n;
    return [x,y];
}

let out_Axis_x=0;
function points_Draw_Axis(canvas,x){
    out_Axis_x = x;
    let context = canvas.getContext("2d");
    context.save();
    context.translate(0,0);
    context.beginPath();
    context.moveTo(0,canvas.offsetHeight/2);
    context.lineTo(canvas.offsetWidth,canvas.offsetHeight/2);
    context.moveTo(x,canvas.offsetHeight);
    context.lineTo(x,0);
    context.stroke();
    context.closePath();
    context.restore();
}

function Out_List_Draw(){
    let table = document.getElementById('table_fx_');
    let canvas = document.getElementById('output_fx_canvas');
    canvas_UpScreen(canvas);
    points_Draw_Axis(canvas,50);
    let canvas2 = document.getElementById('output2_fx_canvas');
    canvas_UpScreen(canvas2);
    fx_Draw_Axis(canvas2);
    if(fx_Type==0){
        // 时域
        let val =  document.getElementById('text_val');
        let val2 =  document.getElementById('text2_val');
        let val3 =  document.getElementById('text3_val');
        let End_frequency = Number(val2.value)+Number(val.value)/100*(Number(val3.value)-Number(val2.value));
        let start_frequency = Number(val2.value);
        if(input_Draw_tpye==0){
            //分离
            for (var i = 1, row; row = table.rows[i]; i++) {
                if(row.cells[3].children[0].innerHTML=='禁用'){
                    let data = row.cells[0].children[0].value
                    let min = Number(row.cells[1].children[0].value);
                    let max = Number(row.cells[2].children[0].value);
                    let fx_data = new FX_class(max,min,0.01,data);

                    Out_Separate_Draw_Line(fx_data,start_frequency,End_frequency,0.01,10,30,40,40,canvas,canvas2);
                }
            }
        }else{
            //结果和
            let fx_datas = [];
            let start_val,end_val,min_step;
            for (var i = 1, row; row = table.rows[i]; i++) {
                if(row.cells[3].children[0].innerHTML=='禁用'){
                    let data = row.cells[0].children[0].value
                    let min = Number(row.cells[1].children[0].value);
                    let max = Number(row.cells[2].children[0].value);
                    fx_datas.push(new FX_class(max,min,0.01,data));
                }
            }
            if(fx_datas.length!=0){
                Out_Sum_Draw_Line(fx_datas,start_frequency,End_frequency,0.01,10,30,40,40,canvas,canvas2);
            }
        }
    }
}

function Out_Sum_Draw_Line(fx_datas,start_frequency,End_frequency,step,ZoomX,ZoomY,ZoomX2,ZoomY2,canvas,canvas2){
    let f = start_frequency - step;

    let val = [];
    let t_s = 0;
    let end_coor=[];
    if(start_frequency!=End_frequency){
        let context = canvas.getContext("2d");
        context.save();
        context.translate(out_Axis_x,canvas.offsetHeight/2);
        context.scale(1,-1);
        context.beginPath();
        while(1){
            f+=step;
            if(f>End_frequency){
                end_coor = val;
                break;
            }
            val[0]=0;
            val[1]=0;
            let tarr=[];
            let f_t=-f;
            for (let i = 0; i < fx_datas.length; i++) {
                tarr=fex_points(fx_datas[i],f_t);
                val[0]+=tarr[0];
                val[1]+=tarr[1];
            }

            if(t_s==0){
                t_s=1;
                context.moveTo(f*ZoomX,Math.sqrt((val[0]*val[0])+(val[1]*val[1]))*ZoomY);
            }else{
                context.lineTo(f*ZoomX,Math.sqrt((val[0]*val[0])+(val[1]*val[1]))*ZoomY);
            }
            console.log("f_val:"+f);
        }
        context.stroke();
        context.closePath();
        context.restore();

        let context2 = canvas2.getContext("2d");
        context2.save();
        context2.translate(canvas2.offsetWidth/2,canvas2.offsetHeight/2);
        context2.scale(1,-1);
        context2.beginPath();
        context2.moveTo(0,0);
        context2.lineTo(end_coor[0]*ZoomX2,end_coor[1]*ZoomY2);
        context2.stroke();
        context2.closePath();
        context2.restore();
    }
}

function Out_Separate_Draw_Line(fx_data,start_frequency,End_frequency,step,ZoomX,ZoomY,ZoomX2,ZoomY2,canvas,canvas2){
    let f = start_frequency - step;
    let val = [];
    let t_s = 0;
    let end_coor=[];
    if(start_frequency!=End_frequency){
        let context = canvas.getContext("2d");
        context.save();
        context.translate(out_Axis_x,canvas.offsetHeight/2);
        context.scale(1,-1);
        context.beginPath();
        while(1){
            f+=step;
            if(f>End_frequency){
                end_coor = val;
                break;
            }
            val[0]=0;
            val[1]=0;
            let f_t = -f;
            val = fex_points(fx_data,f_t);
            if(t_s==0){
                t_s=1;
                context.moveTo(f*ZoomX,Math.sqrt((val[0]*val[0])+(val[1]*val[1]))*ZoomY);
            }else{
                context.lineTo(f*ZoomX,Math.sqrt((val[0]*val[0])+(val[1]*val[1]))*ZoomY);
            }
            console.log("f_val:"+f);
        }
        context.stroke();
        context.closePath();
        context.restore();

        let context2 = canvas2.getContext("2d");
        context2.save();
        context2.translate(canvas2.offsetWidth/2,canvas2.offsetHeight/2);
        context2.scale(1,-1);
        context2.beginPath();
        context2.moveTo(0,0);
        context2.lineTo(end_coor[0]*ZoomX2,end_coor[1]*ZoomY2);
        context2.stroke();
        context2.closePath();
        context2.restore();
    }
}

function canvas_UpScreen(canvas){
   let context = canvas.getContext("2d");
   context.clearRect(0,0,300,300);
   context.save();
}




function text_fun(){
    // let table = document.getElementById('table_fx_');
     let canvas = document.getElementById('input_fx_canvas');
    // canvas_UpScreen(canvas);
    // fx_Draw_Axis(canvas);
    // for (var i = 1, row; row = table.rows[i]; i++) {
    //     let data = row.cells[0].children[0].value
    //     let min = Number(row.cells[1].children[0].value);
    //     let max = Number(row.cells[2].children[0].value);
    //     let fx_data = new FX_class(max,min,0.5,data);
    //     fx_input_Separate_Draw_Line(fx_data,10,20,canvas);
    // }
    Frequency = Number(document.getElementById('text_val').value);
    input_fx_List_Draw();
    input_ex_List_Draw();
    Out_List_Draw();
}