
function getKoreanDate() {
    const date = new Date();
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');

    return `${year}${month}${day}`;
}

// 변수 설정
const init = {
    monList: [
        "1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월",
    ],
    today: new Date(),
    monForChange: new Date().getMonth(),
    activeDate: new Date(),
    nextMonth: function () {
        let d = new Date();
        d.setDate(1);
        d.setMonth(++this.monForChange);
        this.activeDate = d;
        return d;
    },
    prevMonth: function () {
        let d = new Date();
        d.setDate(1);
        d.setMonth(--this.monForChange);
        this.activeDate = d;
        return d;
    },
    addZero: (num) => (num < 10 ? "0" + num : num),
    activeDTag: null,
};
const popupOverlay = $('<div class="popup-overlay"></div>');

// --------------------------------------------------------
$(document).ready(function () {
    // loadCalendars();
    loadYYMM(init.today);
    addEvents();
    $("#menunav").show();
});

// 공통 기능: 날짜 변환 및 체크
async function checkAndConvertDate() {
    const selectedDate = init.activeDate.toISOString().split("T")[0]; // 사용자에 의해 선택된 날짜
    let dateStr = selectedDate.replace(/-/g, '');
    let dateInt = Number(dateStr);
    return {dateStr, dateInt, selectedDate}; // 객체로 반환
}

// 공통 기능: 팝업 초기화 및 오버레이 추가
function initializeAndShowPopup(popupId) {
    initializePopup();
    $("body").append(popupOverlay);
    $(popupId).show();
}

// 팝업을 열 때 초기화 함수
function initializePopup() {
    // 팝업 열기 전 초기화
    $(".select-menu-name").text('');  // 팝업에서 선택된 메뉴 이름 초기화
    $("#select-menu-text").val(''); // 팝업에서 선택된 메뉴 코멘트 초기화
    $('.select-menu-img').css('background-image', 'none'); // 팝업에서 선택된 이미지 초기화
}

function addEvents() {
    /****************************************************************
                        오늘의 메뉴 관련 이벤트
     ****************************************************************/
    let selectedMenuId = null; // 사용자가 선택한 메뉴 정보

    // 메뉴 리스트 팝업 열기
    $("#btn-add-menu").on("click", async function () {
        const {dateInt} = await checkAndConvertDate();

        const checkDateResult = await checkDate(dateInt);
        if (checkDateResult.exists && checkDateResult.menu_id) {
            alert("이미 메뉴가 존재합니다.");
            return;
        }
        initializeAndShowPopup("#myForm");
        window.isMenuEdit = false;
    });

    // 메뉴 클릭 시 선택한 메뉴 정보 가져와서 오늘의 메뉴 디테일 팝업 열기
    $(".menu").on("click", function () {
        selectedMenuId = $(this).data("menu-id"); // 선택한 메뉴 정보 가져오기
        let menu = menuList.find(m => m.id === selectedMenuId);

        if (menu) {
            initializeAndShowPopup("#myForm2");
            $("#myForm").hide();
            $(".select-menu-img").attr("src", menu.imgUrl).attr("alt", menu.name);
            $(".select-menu-name").text(menu.name);
        }
    });

    // 오늘의 메뉴 저장
    $(".btn-save").on("click", async function () {
        const comment = $("#select-menu-text").val();

        if (!comment) {
            alert("코멘트를 입력하세요.");
            return;
        }

        initializePopup();
        const {dateInt} = await checkAndConvertDate();

        if (window.isMenuEdit) {
            const checkDateResult = await checkDate(dateInt);
            const calendarMenuId = checkDateResult.menu_id;
            await updateCalendarByMenu(calendarMenuId, comment);
            window.isMenuEdit = false;
        } else {
            if (selectedMenuId) {
                await addCalendarByMenu(selectedMenuId, comment);
            } else {
                alert("메뉴를 선택하세요.");
            }
        }

        // 저장 후 팝업 닫기
        $("#myForm2").hide();
        $(".popup-overlay").remove();
        selectedMenuId = null; // 선택한 메뉴 정보 초기화
    });

    // 오늘의 메뉴 수정
    $('.today-menu-container').on('click', '.btn-edit', async function () {
        const {dateInt} = await checkAndConvertDate();

        initializeAndShowPopup('#myForm2');
        $('#myForm').hide();

        const todayMenuData = await buildEditTodayMenu(dateInt);
        if (todayMenuData) {
            $("#select-menu-text").val(todayMenuData.comment);
            window.isMenuEdit = true;
        } else {
            $("#select-menu-text").empty();
        }
    });

    // 오늘의 메뉴 삭제
    $(document).on("click", '.btn-delete', async function () {
        if (confirm("오늘의 메뉴를 삭제하시겠습니까?")) {
            const {dateInt, selectedDate} = await checkAndConvertDate();
            const checkDateResult = await checkDate(dateInt);

            if (checkDateResult.exists) {
                await deleteCalendarByMenu(checkDateResult.id, checkDateResult.menu_id, checkDateResult.comment);
            }
        }
    });

    function closePopup(popupId) {
        $(popupId).hide();
        popupOverlay.remove();
    }

    $('.btn-cancel').on('click', function () {
        closePopup('#myForm2');
    });

    $(".menu-close").on("click", function () {
        closePopup("#myForm");
    });

    $(".menu-close2").on("click", function () {
        closePopup("#myForm2");
    });

    popupOverlay.on("click", function () {
        closePopup("#myForm");
        closePopup("#myForm2");
    });

    /****************************************************************
                        일정 메모 관련 이벤트
     ****************************************************************/

    // 메모 부분 스크롤
    $(".event-list li").scroll(function () {
        var scrollTop = $(this).scrollTop();

        // 스크롤이 맨 위에 도달할 때
        if (scrollTop === 0) {
            $(this).addClass("scroll-top");
            setTimeout(function () {
                $(".event-list li").removeClass("scroll-top");
            }, 500);
        }
    });

    // 메모 추가 했을 때 메모 입력 시 높이 조절
    $("#new-memo").on("input", function() {
        this.style.height = "auto";
        this.style.height = (this.scrollHeight) + "px";
    });

    $("#new-memo").on("blur", function () {
        $(this).val("").hide();
    });

    // 메모 저장 + 수정
    // 입력창에서 엔터키 누를 때 메모 저장
    $("#new-memo").on("keydown", async function (e) {
        if (e.key === "Enter") {
            e.preventDefault();
            const memoText = $("#new-memo").val();

            // 메모 수정할 때 저장할 때 구별
            if ($(this).data("mode") === "edit") {
                await updateCalendarByMemo(memoText);
            } else {
                await addCalendarByMemo(memoText);
            }
        } else if (e.key === "Escape") {
            $(this).val("").hide();
        }
    });

    // 메모 추가
    $("#btn-add-memo").on("click", async function () {
        const {dateInt} = await checkAndConvertDate();

        const checkDateResult = await checkDate(dateInt);
        if (checkDateResult.exists && checkDateResult.memo) {
            alert("이미 메모가 존재합니다.");
            return;
        }

        // 기존 메모가 없는 경우에만 추가 모드로 설정
        if ($(".event-list li").length === 0) {
            $("#new-memo")
                .val("")
                .css("height", "100px")
                .data("mode", "add")
                .show()
                .focus();
            $("#notification").hide();
        }
    });

    // 메모 수정
    $(document).on("click", ".memo-edit", function () {

        // 기존 메모가 있는 경우 수정 모드로 설정
        if ($(".event-list li").length !== 0) {

            $(".memo-delete, .memo-edit").hide();

            const memoText = $(".event-list li").text().trim();

            // 기존 메모 높이 가져오기
            const existingMemoHeight = $(".event-list li").outerHeight();

            // 수정 모드로 설정하면서 높이 설정
            $("#new-memo").val(memoText)
                .css("height", existingMemoHeight + "px")
                .data("mode", "edit")
                .show()
                .focus();
            $(".event-list li").hide();
        }
    });

    // 메모 삭제
    $(document).on("click", ".memo-delete", async function () {
        if (confirm("메모를 삭제하시겠습니까?")) {
            const memoText = $("#new-memo").val();
            const {dateInt, selectedDate} = await checkAndConvertDate();
            const checkDateResult = await checkDate(dateInt);

            if (checkDateResult.exists) {
                await deleteCalendarByMemo(checkDateResult.id, memoText);
            }
        }
    });

    /****************************************************************
                            캘린더 관련 이벤트
    ****************************************************************/

    // 다음달 클릭
    $(".btn-cal.next").on("click", () => loadYYMM(init.nextMonth()));

    // 이전달 클릭
    $(".btn-cal.prev").on("click", () => loadYYMM(init.prevMonth()));

    // 날짜 클릭
    $(".date").on("click", function () {
        const selectedDate = $(this).data("date"); // 클릭한 날짜의 데이터 속성 값 가져오기
        alert(selectedDate);
    });

    // 사용자가 클릭한 날짜 표시
    $(".cal-body").on("click", "td", function(e) {
        const target = $(e.target);
        if (target.hasClass("day")) {

            // 현재 활성화된 날짜 태그가 존재하는 경우, 'day-active' 클래스 제거
            if (init.activeDTag) {
                init.activeDTag.removeClass("day-active");
            }
            let day = Number(target.text()); // 클릭된 날짜의 숫자 값을 가져옴
            let date = target.data("fdate"); // 클릭된 날짜의 'fdate' 데이터 속성을 가져옴

            // 클릭된 날짜에 'day-active' 클래스 추가 (활성화 상태 표시)
            target.addClass("day-active");

            // init 객체의 활성화된 날짜 태그를 클릭된 날짜로 업데이트
            init.activeDTag = target;
            init.activeDate.setDate(day);

            // String 타입인 date 를 int 타입으로 바꾸기
            if (date) {
                let dateStr = date.replace(/\./g, '');
                let dateInt = Number(dateStr);
                loadData(dateInt);
            } else {
                console.error("date 값이 없습니다.");
            }
        }
    });
}

// 캘린더를 구성하고 초기화하는 함수
function buildCalendar(data){
    // loadYYMM(init.today); // 현재 날짜로 달력 초기화
    data.forEach(date => {
        const year = date.id.toString().substring(0, 4);
        const month =  date.id.toString().substring(4, 6);
        const day =  date.id.toString().substring(6, 8);

        console.log(date.id);
        const cell = $(`.cal-body td[data-fdate="${year}.${month}.${day}"]`);

        // 날짜에 데이터가 있으면 색상 표시
        cell.addClass("event");
    });

}


// 달력에 년도와 월을 로드하는 함수
function loadYYMM(fullDate) {
    clearTodayMenuMemo();
    let yy = fullDate.getFullYear(); // 년도
    let mm = fullDate.getMonth() + 1; // 월 (0부터 시작)
    let firstDay = new Date(yy, mm, 1); // 해당 월의 첫째 날
    let lastDay = new Date(yy, mm + 1, 0); // 해당 월의 마지막 날
    let markToday;

    // 오늘 날짜를 표시하기 위한 변수 설정
    if ((mm - 1) === init.today.getMonth() && yy === init.today.getFullYear()) {
        markToday = init.today.getDate();
    }

    // 월과 년도를 UI에 표시
    $(".cal-month").text(init.monList[mm - 1]);
    $(".cal-year").text(yy + "년");

    let trtd = "";
    let startCount; // 첫째 주 시작 여부
    let countDay = 0; // 날짜 카운트 변수 초기화
    for (let i = 0; i < 6; i++) { // 6주(행)까지 반복
        trtd += "<tr>";
        for (let j = 0; j < 7; j++) { // 7일(열)까지 반복
            if (i === 0 && !startCount && j === firstDay.getDay()) {
                startCount = 1; // 첫째 주 첫째 날을 시작으로 표시
            }
            if (!startCount) {
                trtd += "<td>"; // 첫째 주 시작 전에는 빈 td 요소 추가
            } else {
                // 각 날짜에 대한 정보 설정
                let fullDate =
                    yy + "." + init.addZero(mm) + "." + init.addZero(countDay + 1); // 날짜 포맷 설정

                trtd += `<td class="day`;  // td 요소에 클래스 추가
                trtd += markToday && markToday === countDay + 1 ? ' today" ' : '"'; // 오늘 날짜인 경우 클래스 추가
                trtd += ` data-date="${countDay + 1}" data-fdate="${fullDate}">`; // 데이터 속성 추가

            }
            trtd += startCount ? ++countDay : ""; // 날짜 카운트 증가
            if (countDay === lastDay.getDate()) {
                startCount = 0; // 마지막 날짜에 도달하면 첫째 주 표시 종료
            }
            trtd += "</td>";
        }
        trtd += "</tr>";
    }
    $(".cal-body").html(trtd);

    loadCalendars();
}


