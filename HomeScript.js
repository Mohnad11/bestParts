$(document).ready(function() {

        return database.ref('/parts/').orderByChild('timestamp').once('value').then(function(snapshot) {
            var cnt=0;
            snapshot.forEach(function(childSnapshot) {
                var childKey = childSnapshot.key;
                var childData = childSnapshot.val();
                if(currentUser==null){
                    cnt++;
                    if(cnt==10)
                        return;
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
                    cnt++;
                    if(cnt==10)
                        return;
                    var arr=JSON.parse(childData.fit);
                    var userCar=currentUser.car.split("_");
                    for(var i=0;i<arr.cars.length;i++) {
                        if (arr.cars[i].year == userCar[2] && arr.cars[i].make == userCar[0] && arr.cars[i].model == userCar[1]) {
                            $('.items_div').append($('<div class="item_container">\n' +
                                '                <img class="item_image" src="' + childData.picUrl + '" height="150" width="100%"/>\n' +
                                '                <p class="item_name">' + childData.name + '</p>\n' +
                                '                <p class="item_desc">' + childData.desc + '</p>\n' +
                                '                <button class="showfit" onclick="showFitsModal('+childKey+')">' + "show cars fitting"+ '</button>\n' +
                                '                <p class="fityourcar">' + "fits your car " + userCar[0]+" "+ userCar[1]+" "+userCar[2]+ '</p>\n' +
                                '                <p class="item_price">' + childData.price + '</p>\n' +
                                '                <button class="shop_button" onclick="showAddToCartModal('+childKey+')">add to cart</button>\n' +
                                '            </div>'));
                        }
                    }
                }
            });
        })

});