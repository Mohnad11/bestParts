var totalPrice=0;
function deleteFromCart(part_id){
    //alert(part_id)
    $('#'+part_id).hide();
    totalPrice=totalPrice-$('#'+part_id+' .totalQtyPrice').html();;
    $("#totalPrice").text("total price: "+totalPrice)
    if(totalPrice==0){
        $('#payBtn').attr("disabled", true);
    }
    var qty=$('#'+part_id+' .qty').html();
    return database.ref('/users/'+currentUser.uid+"/shop").once('value').then(function(snapshot) {
        var shop;
        var first=true;
        if(cartShopCnt==1){

            shop = 'null';
        }
        if(cartShopCnt>1){
            var shopArr=JSON.parse(snapshot.val());

            shop = '{"shop":[';

            for(var i=0;i<shopArr.shop.length;i++){

                if(part_id!=shopArr.shop[i].part_id){
                    if(first==true){
                        shop=shop+'{"part_id":"'+shopArr.shop[i].part_id+'","qty":"'+shopArr.shop[i].qty+'"}'
                        first=false
                    }else{
                        shop=shop+',{"part_id":"'+shopArr.shop[i].part_id+'","qty":"'+shopArr.shop[i].qty+'"}'
                    }
                }
            }

            shop = shop + ']}';
        }

        var updates = {};
        cartShopCnt = cartShopCnt - 1;
        updates['/users/' + currentUser.uid + "/shopCartCnt"] = cartShopCnt;
        updates['/users/' + currentUser.uid + "/shop"] = shop;
        return firebase.database().ref().update(updates);

    });

}
function payment() {

    return database.ref('/users/'+currentUser.uid+"/shop").once('value').then(function(snapshot) {
        var shop = snapshot.val();
        var randid=Math.floor(Math.random() * 1000000) + 1000;
        var today = new Date();
        var dd = String(today.getDate()).padStart(2, '0');
        var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
        var yyyy = today.getFullYear();

        var nowDate = mm + '/' + dd + '/' + yyyy;
        firebase.database().ref('orders/' + currentUser.uid+randid).set({
            uid:currentUser.uid,
            shop: shop,
            price:totalPrice,
            date:nowDate,
            status:"pending"

        });
        var updates = {};
        updates['/users/' + currentUser.uid + "/shopCartCnt"] = 0;
        updates['/users/' + currentUser.uid + "/shop"] = "null";
        return firebase.database().ref().update(updates);
    });
}


$(document).ready(function(){
    $('#payBtn').attr("disabled", true);
    //alert(currentUser.uid)
    return database.ref('/users/'+currentUser.uid+"/shop").once('value').then(function(snapshot) {
        var shopArr=JSON.parse(snapshot.val());

       for(var i=0;i<shopArr.shop.length;i++){
           $('#shopCartTableBody').append($(' <tr id="'+shopArr.shop[i].part_id+'">\n' +
               '                                    <td class="partname">'+''+'</td>\n' +
               '                                    <td class="partprice">'+''+'</td>\n' +
               '                                    <td class="qty">'+shopArr.shop[i].qty+'</td>\n' +
               '                                    <td class="totalQtyPrice">'+''+'</td>\n' +
               '                                    <td>'+'<button type="button" class="btn btn-danger delete_btn" onclick="deleteFromCart('+shopArr.shop[i].part_id+')">Delete</button>'+'</td>\n' +
               '                                </tr>'));
             database.ref('/parts/'+shopArr.shop[i].part_id).once('value').then(function(snapshot2) {
                 $('#'+snapshot2.key+' .partname').html(snapshot2.val().name)
                 $('#'+snapshot2.key+' .partprice').html(snapshot2.val().price)
                 var qty=$('#'+snapshot2.key+' .qty').html();
                 $('#'+snapshot2.key+' .totalQtyPrice').html(snapshot2.val().price*qty)

                 totalPrice=snapshot2.val().price*qty+totalPrice;
                 $("#totalPrice").text("total price: "+totalPrice)
                 if(totalPrice>0)
                 {
                     $('#payBtn').attr("disabled", false);
                 }
            });


        }

    })
});