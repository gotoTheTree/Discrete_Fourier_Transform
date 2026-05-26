const F_range = document.getElementById('text_val');
F_range.addEventListener('input', function(e) {
    //console.clear();
    val =  document.getElementById('text_val');
    val2 =  document.getElementById('text2_val');
    val3 =  document.getElementById('text3_val');
    End_frequency = Number(val2.value)+Number(val.value)/100*(Number(val3.value)-Number(val2.value));
    console.log('frequency:', End_frequency);
    text_fun();
    // 适合需要实时反馈的场景（音量调节、颜色选择等）
});