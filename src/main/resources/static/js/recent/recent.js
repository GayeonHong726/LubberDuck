
// 존재 여부에 따른 추가
async function checkToRecent(cocktail) {

    if(cocktail == null || logged_id === -1){
        return;
    }

    // 최근 본 목록에 이미 있는지 확인하기
    let findRecent = null;

    await $.ajax({
        url: "/recentData/detail/" + logged_id + "/" + cocktail.id,
        type: "GET",
        cache: false,
        success: function (data, status) {
            if (status === "success") {
                if (data.status !== "OK") {
                    alert(data.status);
                    return;
                }
                findRecent = data.data;
            }
        },
    });

    // 최근 본 목록에 없다면 카트 추가
    if(!findRecent) {
        await addToRecent(cocktail);
    } else {
        await deleteToRecent(cocktail);
        await addToRecent(cocktail);
    }
}

async function addToRecent(cocktail) {
    // 전달할 parameter 준비 (POST)
    const data = {
        "userId": logged_id,
        "cocktailId": cocktail.id,
    };

    $.ajax({
        url: "/recentData/add",
        type: "POST",
        data: data,
        cache: false,
        success: function (data, status) {
            if (status === "success") {
                if (data.status !== "OK") {
                    alert(data.status);
                }
            }
        },
    });
}

async function deleteToRecent(cocktail) {
    // 전달할 parameter 준비 (POST)
    const data = {
        "userId": logged_id,
        "cocktailId": cocktail.id,
    };

    $.ajax({
        url: "/recentData/delete/" + logged_id + "/" + cocktail.id,
        type: "POST",
        data: data,
        cache: false,
        success: function (data, status) {
            if (status === "success") {
                if (data.status !== "OK") {
                    alert(data.status);
                }
            }
        },
    });
}

function loadRecent(user_id){
    $.ajax({
        url: "/recentData/list/" + user_id,
        type: "GET",
        cache: false,
        success: function (data, status) {
            if (status === "success") {
                // 서버쪽 에러 메세지 있는경우
                if (data.status !== "OK") {
                    alert(data.status);
                    return;
                }
                buildRecent(data);
            }
        },
    });
}

function buildRecent(result) {
    result.data.forEach(recent => {
        $('#recentSection').append($(`
            <table class="recentTable">
                <tr>
                    <td class="cttName">${recent.menu.name}</td>
                </tr>
                <tr>
                    <td>
                        <div style="background-image: url('${recent.menu.imgUrl}')" class="cttImg"></div>
                    </td>
                </tr>
            </table>
        `))
    })
}