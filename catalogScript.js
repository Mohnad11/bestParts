function showFitsModal(part_id){
    $('#fitCarsBody').empty();
    $('#partFitsCarsModal').modal('toggle')
    return database.ref('/parts/'+part_id+'/fit').once('value').then(function(snapshot) {
        var arr=JSON.parse(snapshot.val());
        for(var i=0;i<arr.cars.length;i++){
            $('#fitCarsBody').append($(' <tr>\n' +
                '                                    <td>'+arr.cars[i].year+'</td>\n' +
                '                                    <td>'+arr.cars[i].make+'</td>\n' +
                '                                    <td>'+arr.cars[i].model+'</td>\n' +
                '                                </tr>'));
        }
    });
}
$(document).ready(function(){

    var carquery = new CarQuery();
    carquery.init();
    carquery.initYearMakeModelTrim('car_year_selector', 'car_make_selector', 'car_model_selector', '');

    $("#select_button").click(function(){
        $(".item_container").remove();
        return database.ref('/parts/').once('value').then(function(snapshot) {
            snapshot.forEach(function(childSnapshot) {
                var childKey = childSnapshot.key;
                var childData = childSnapshot.val();
                var car=$('#car_make_selector').val()+"_"+$('#car_model_selector').val()+"_"+$('#car_year_selector').val();
                var part= new Object();
                part.id=childKey;
                part.name=childData.name;
                part.desc=childData.desc;
                part.price=childData.price;
                var arr=JSON.parse(childData.fit)
                for(var i=0;i<arr.cars.length;i++){
                    if(arr.cars[i].year==$('#car_year_selector').val() && arr.cars[i].make==$('#car_make_selector').val() && arr.cars[i].model==$('#car_model_selector').val()  ){
                        $('.items_div').append($('<div class="item_container">\n' +
                            '                <img class="item_image" src="' + childData.picUrl + '" height="150" width="100%"/>\n' +
                            '                <p class="item_name">' + childData.name + '</p>\n' +
                            '                <p class="item_desc">' + childData.desc + '</p>\n' +
                            '                <button class="showfit" onclick="showFitsModal('+childKey+')">' + "show cars fitting"+ '</button>\n' +
                            '                <p class="item_price">' + childData.price + '</p>\n' +
                            '                <button class="shop_button" onclick="showAddToCartModal('+childKey+')">add to cart</button>\n' +
                            '            </div>'));
                    }
                }

            });

        });
    });
    $("#search_button").click(function(){
        $(".item_container").remove();
        return database.ref('/parts/').once('value').then(function(snapshot) {
            snapshot.forEach(function(childSnapshot) {
                var childKey = childSnapshot.key;
                var childData = childSnapshot.val();
                var val=$('#search_input').val();
                if(childData.name.includes(val)==true ||childData.category.includes(val)==true || childData.fit.includes(val.toLowerCase())==true) {
                    if(currentUser==null)
                    {
                        $('.items_div').append($('<div class="item_container">\n' +
                            '                <img class="item_image" src="' + childData.picUrl + '" height="150" width="100%"/>\n' +
                            '                <p class="item_name">' + childData.name + '</p>\n' +
                            '                <p class="item_desc">' + childData.desc + '</p>\n' +
                            '                <button class="showfit" onclick="showFitsModal('+childKey+')">' + "show cars fitting"+ '</button>\n' +
                            '                <p class="item_price">' + childData.price + '</p>\n' +
                            '                <button class="shop_button" onclick="showAddToCartModal('+childKey+')">add to cart</button>\n' +
                            '            </div>'));
                    }
                    else{
                        var carArr=currentUser.car.split("_");
                        $('.items_div').append($('<div class="item_container">\n' +
                            '                <img class="item_image" src="' + childData.picUrl + '" height="150" width="100%"/>\n' +
                            '                <p class="item_name">' + childData.name + '</p>\n' +
                            '                <p class="item_desc">' + childData.desc + '</p>\n' +
                            '                <button class="showfit" onclick="showFitsModal('+childKey+')">' + "show cars fitting"+ '</button>\n' +
                            '                <p class="fityourcar">' + "fits your car " + carArr[0]+" "+ carArr[1]+" "+carArr[2]+ '</p>\n' +
                            '                <p class="item_price">' + childData.price + '</p>\n' +
                            '                <button class="shop_button" onclick="showAddToCartModal('+childKey+')">add to cart</button>\n' +
                            '            </div>'));
                    }

                }

            });

        });
    });
});
