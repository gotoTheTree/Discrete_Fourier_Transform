console.log("js_Initing...");
console.log('input:main.js');
let lastRenderTime = 0;
let Render_SPEED = 1000;//

var Tim_up=0;

const main = (currentTime) => {
    requestAnimationFrame(main);
    const IntervalTime = currentTime - lastRenderTime;
    if(IntervalTime < Render_SPEED){
        return
    }
    lastRenderTime = currentTime;
}

requestAnimationFrame(main);