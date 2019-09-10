var currentUser=null;
var database;
var cartShopCnt=0;
var selected_part_id=0;
var mobileMode=false;
function openPage(pageName){

    $('#mainframe').attr('src', pageName+".html")
}
function emptySelectors(){
    $("#car_year_selector_signup").val("");
    $("select#car_make_selector_signup").html("<option value=''>---</option>");
    $("select#car_model_selector_signup").html("<option value=''>---</option>");
}
function getUser(user){
    currentUser=user;
    return database.ref('/users/'+user.uid).once('value').then(function(snapshot) {
        currentUser.fullname=snapshot.val().fullname;
        currentUser.car=snapshot.val().car;
        saveUserCookie(currentUser);
        $('#signInModal').modal('hide');
        $("#msgContent").html("hi "+currentUser.fullname)
        $('.toast').toast('show');

    })
}
function saveUserCookie(user) {
    var jsonUser='user={"uid":"'+user.uid+'","fullname":"'+user.fullname+'","car":"'+user.car+'"}';
    document.cookie=jsonUser;
}
function signIn(){

    var user=getUserFromCookies();
    if(user==null){
        $('#signInModal').modal('toggle');
    }
    else{
        currentUser=user;
        showUserInfoModal();
        setUserOrders();
    }

}
function logout() {
    deleteAllCookies();
    $("#msgContent").html("bye bye "+currentUser.fullname)
    $('.toast').toast('show');
    currentUser=null;
    $('#userInfoModal').modal('hide');
}
function deleteAllCookies() {
    var cookies = document.cookie.split(";");

    for (var i = 0; i < cookies.length; i++) {
        var cookie = cookies[i];
        var eqPos = cookie.indexOf("=");
        var name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
        document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT";
    }
}
function showUserInfoModal(){
    $("#user_full_name_header").text("hi "+currentUser.fullname)
    $("#userInfoModal").modal("toggle");
    var car=currentUser.car.split("_");
    $("#car_year_info").val(car[2]);
    $("#car_make_info").val(car[0]);
    $("#car_model_info").val(car[1]);
    //alert();

}
function getUserFromCookies(){
    var cookies= decodeURIComponent(document.cookie);
    var arr=cookies.split(";");
    for(var i=0;i<arr.length;i++){
        //console.log(arr[i])
        var cookie = arr[i];
        while (cookie.charAt(0) == ' ') {
            cookie= cookie.substring(1);
        }
        if (cookie.indexOf("user=") == 0) {
            userJson= cookie.substring("user=".length, cookie.length);
            return JSON.parse(userJson);
        }
    }
    return null;
}
function showOrder(order_id) {
    $("#orderShopTableBody").empty();
    $('#orderModal').modal('toggle');
    return database.ref('/orders/'+order_id).once('value').then(function(snapshot) {
        var shopArr=JSON.parse(snapshot.val().shop)
        for(var i=0;i<shopArr.shop.length;i++){
            $('#orderShopTableBody').append($(' <tr id="'+shopArr.shop[i].part_id+'">\n' +
                '                                    <td class="partname">'+''+'</td>\n' +
                '                                    <td class="partprice">'+''+'</td>\n' +
                '                                    <td class="qty">'+shopArr.shop[i].qty+'</td>\n' +
                '                                    <td class="totalQtyPrice">'+''+'</td>\n' +
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
    });

}
function setUserOrders(){
    $('#ordersTableBody').empty();
    return database.ref('/orders/').once('value').then(function(snapshot) {
        snapshot.forEach(function(childSnapshot) {
            var childKey = childSnapshot.key;
            var childData = childSnapshot.val();
            $('#ordersTableBody').append($(' <tr>\n' +
                '                                    <td>'+childSnapshot.val().date+'</td>\n' +
                '                                    <td>'+childSnapshot.val().status+'</td>\n' +
                '                                    <td>'+childSnapshot.val().price+'</td>\n' +
                '                                    <td>'+'<button type="button" class="btn btn-primary delete_btn" onclick="showOrder('+"'"+childKey+"'"+')">show</button>'+'</td>\n' +
                '                                </tr>'));


        });

    })
}
function showEditCarDiv(){
    $("#car_info_div").hide();
    $("#car_update_div").show();
}
function updateCar(){
    $("#car_info_div").show();
    $("#car_update_div").hide();
    var car = $('#car_make_selector_update').val() + "_" + $('#car_model_selector_update').val() + "_" + $('#car_year_selector_update').val();
    $('#car_make_info').val($('#car_make_selector_update').val())
    $('#car_model_info').val($('#car_model_selector_update').val())
    $('#car_year_info').val($('#car_year_selector_update').val())
    currentUser.car=car;
    saveUserCookie(currentUser);
    var updates = {};
    updates['/users/' + currentUser.uid+"/car"] = car;
    return firebase.database().ref().update(updates);
}
function showAddToCartModal(part_id){
    if(currentUser==null){
        $("#msgContent").html("please sign in before adding items")
        $('.toast').toast('show');
        return;
    }
    selected_part_id=part_id;
    for(var i=1;i<=100;i++){
        $('#qtySelect').append('<option>'+i+'</option>');
    }
    $('#AddToCartModal').modal('toggle');


}
function addToCart(){
    var qty=$("#qtySelect").val();
    return database.ref('/users/'+currentUser.uid+"/shop").once('value').then(function(snapshot) {
        var shop;
        var exists=false;
        if(cartShopCnt==0){

            shop = '{"shop":[{"part_id":"'+selected_part_id+'","qty":"'+qty+'"}]}';
        }
        if(cartShopCnt>=1){
            var shopArr=JSON.parse(snapshot.val());
           // snapshot.val()
            //alert(shopArr.shop[0].part_id);
            //shopArr.shop.push('{"part_id":"'+part_id+'"}')
            shop = '{"shop":[';

            for(var i=0;i<shopArr.shop.length;i++){
                if(selected_part_id==shopArr.shop[i].part_id){
                    exists=true;
                    var newQty=(parseInt(shopArr.shop[i].qty)+parseInt(qty));
                    if(i==shopArr.shop.length-1){

                        shop=shop+'{"part_id":"'+shopArr.shop[i].part_id+'","qty":"'+newQty+'"}'
                    }else{
                        shop=shop+'{"part_id":"'+shopArr.shop[i].part_id+'","qty":"'+newQty+'"},'
                    }

                }else {
                    shop = shop + '{"part_id":"' + shopArr.shop[i].part_id + '","qty":"' + shopArr.shop[i].qty + '"},'
                }
            }
            if(exists==false) {
                shop = shop + '{"part_id":"' + selected_part_id + '","qty":"' + qty + '"}'
            }
            shop = shop + ']}';
        }
        if(exists==false) {
            var updates = {};
            cartShopCnt = cartShopCnt + 1;
            updates['/users/' + currentUser.uid + "/shopCartCnt"] = cartShopCnt;
            updates['/users/' + currentUser.uid + "/shop"] = shop;
            return firebase.database().ref().update(updates);
        }
    });

}
function onResizeWindow() {
    var w = window.outerWidth;
    if(w<=1050 && mobileMode==false){
        mobileMode=true;
        $('#full_page_header').hide();
        $('#mobile_page_header').show();
    }
    if(w>1050){
        mobileMode=false;
        $('#full_page_header').show();
        $('#mobile_page_header').hide();
    }


}
$(document).ready(function(){
    window.onresize = onResizeWindow;
    onResizeWindow();
    $("#sign_in_error").hide();
    $("#sign_up_error").hide();
    $("#car_update_div").hide();
    $("#shopcartCnt").hide();

    var config = {
        apiKey: "AIzaSyBTuNbxX8zNJ-nRki9Kbt5hn8aFkf_y9Xg",
        authDomain: "finalwebproject-96747.firebaseapp.com",
        databaseURL: "https://finalwebproject-96747.firebaseio.com",
        storageBucket: "bucket.appspot.com"
    };
    // Initialize Firebase
    firebase.initializeApp(config);
     database = firebase.database();
    currentUser=getUserFromCookies();
    window.alert = function() {};
    console.log(document.cookie)
    if(currentUser!=null) {
        var shopCartCntRef = firebase.database().ref('users/' + currentUser.uid + '/shopCartCnt');
        shopCartCntRef.on('value', function (snapshot) {
            //alert(snapshot.val())
            cartShopCnt = snapshot.val();
            if (snapshot.val() > 0) {

                $("#shopcartCnt").show();
                $("#shopcartCnt").text(snapshot.val());
            } else {
                $("#shopcartCnt").hide();
                $("#shopcartCnt").text(snapshot.val());
            }
        });
    }
    var carquery = new CarQuery();
    carquery.init();
    carquery.initYearMakeModelTrim('car_year_selector_signup', 'car_make_selector_signup', 'car_model_selector_signup', '');
    carquery.initYearMakeModelTrim('car_year_selector_update', 'car_make_selector_update', 'car_model_selector_update', '');


    $("#sign_in_button").click(function(){
        var email=$("#email_input").val();
        var pass=$("#password_input").val();
        firebase.auth().signInWithEmailAndPassword(email, pass).then(function(user) {

            if (user) {
                getUser(user);
            }
        }, function(error) {
            var errorCode = error.code;
            var errorMessage = error.message;
            alert(errorCode)

            if(errorCode=="auth/user-not-found" || errorCode=="auth/invalid-email" || errorCode=="auth/wrong-password")
            {
                $("#sign_in_error").show();
                $("#sign_in_error").text("user not found please sign up")
                $("#email_input").css("border-color","red")
                $("#password_input").css("border-color","red")
            }
        });

    });
    $("#sign_up_button").click(function() {
        $("#sign_up_error").hide();
        $("#fullname_signup").css("border-color","#ccc");
        $("#email_signup").css("border-color","#ccc")
        $("#password_signup").css("border-color","#ccc")
        var email = $("#email_signup").val();
        var pass = $("#password_signup").val();
        var fullname = $("#fullname_signup").val();
        let res = /^[a-zA-Z ]+$/.test(fullname);
        if(res==false){
            $("#sign_up_error").text("enter your name")
            $("#fullname_signup").css("border-color","red")
            $("#sign_up_error").show();
            return;
        }
        firebase.auth().createUserWithEmailAndPassword(email, pass).then(function(user) {
            if (user) {
                var car = $('#car_make_selector_signup').val() + "_" + $('#car_model_selector_signup').val() + "_" + $('#car_year_selector_signup').val();
                if ($('#car_make_selector_signup').val() == "") {
                    car = "null";
                }
                firebase.database().ref('users/' + user.uid).set({
                    fullname: fullname,
                    car: car
                });

                //$("#sign_up_toast").toast('show');
                currentUser=user;
                currentUser.fullname=fullname;
                currentUser.car=car;
            }
        }, function(error) {
            var errorCode = error.code;
            var errorMessage = error.message;

            if(errorCode=="auth/email-already-in-use"){
                $("#sign_up_error").text("email already in use")
                $("#email_signup").css("border-color","red")
                $("#sign_up_error").show();
            }
            if(errorCode=="auth/invalid-email"){
                $("#sign_up_error").text("invalid email")
                $("#email_signup").css("border-color","red")
                $("#sign_up_error").show();
            }
            if(errorCode=="auth/weak-password"){
                $("#sign_up_error").text("weak password")
                $("#password_signup").css("border-color","red")
                $("#sign_up_error").show();
            }
        });






    });
});
