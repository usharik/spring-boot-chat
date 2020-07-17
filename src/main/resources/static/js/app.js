let ChatApp = angular.module('ChatApp', []);
let activeUser = null;
let currentUser = null;

ChatApp.controller('UserListController', function ($scope, $http) {

    $scope.setSelected = function(user) {
        $scope.activeUser = user;
        activeUser = user;
    }

    $http.get("api/v1/user/all")
        .then(resp => {
                $scope.userList = resp.data;
                $scope.activeUser = resp.data[0];
                activeUser = resp.data[0];
            },
            resp => {
                console.error(resp);
            });

    $http.get("api/v1/user/current")
        .then(resp => {
                $scope.currentUser = resp.data;
                currentUser = resp.data;
            },
            resp => {
                console.error(resp);
            });

})

ChatApp.controller('ChatController', function ($scope, $http) {
    const socket = new SockJS('/websocketApp');
    const stompClient = Stomp.over(socket);
    stompClient.connect({}, connectionSuccess);

    function connectionSuccess() {
        stompClient.subscribe('/topic/status', onStatusMessageReceived);
        stompClient.subscribe('/user/queue/chat', onMessageReceived);
        stompClient.send("/app/chat.newUser", {}, JSON.stringify({
            senderName : name,
            type : 'newUser'
        }))
    }

    $scope.messageList = [];
    $scope.content = "";

    function onStatusMessageReceived(payload) {
        console.info("New status message " + payload);
    }

    function onMessageReceived(payload) {
        const message = JSON.parse(payload.body);
        $scope.messageList.push({
            style: "start",
            receiverName: message.receiverName,
            senderName: message.senderName,
            content: message.content
        })
        $scope.$apply();
    }

    $scope.sendMessage = function () {
        let msg = {
            style: "end",
            receiverName: activeUser.username,
            senderName: currentUser.username,
            content: $scope.content
        };
        $scope.messageList.push(msg);
        stompClient.send("/app/chat.sendPersonalMessage", {}, JSON
            .stringify(msg));
        $scope.content = "";
    }
});