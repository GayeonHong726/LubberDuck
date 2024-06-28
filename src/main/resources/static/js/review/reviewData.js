

// function loadReviews(cocktail, page){
//     $.ajax({
//         url: "/review/list/" + cocktail.id + "/" + page,
//         type: "GET",
//         cache: false,
//         success: function (data, status) {
//             if (status === "success") {
//                 // 서버쪽 에러 메세지 있는경우
//                 if (data.status !== "OK") {
//                     // alert(data.status);
//                     return;
//                 }
//
//                 // data.data.forEach(review => alert(review.content));
//                 buildReviewSection(data.data);
//             }
//         },
//     });
// }


function buildReviewSection(reviews){
    //     // 예제 데이터로 임시 리뷰 목록 설정
    console.log(reviews);
    reviewsData = reviews;

    // 최신순으로 초기에 정렬하여 렌더링
    renderReviews(reviewsData);

    // 정렬 함수: 최신순 또는 별점순으로 리뷰를 정렬합니다.
    // function sortReviews(reviews, sortType) {
    //     if (sortType === '최신순') {
    //         return reviews.slice().sort((a, b) => new Date(b.regdate) - new Date(a.regdate));
    //     } else if (sortType === '별점순') {
    //         return reviews.slice().sort((a, b) => b.rate - a.rate);
    //     }
    //     return reviews;
    // }

    // 리뷰 목록을 HTML에 렌더링합니다.
    function renderReviews(reviews) {
        var reviewsContainer = document.querySelector('.reviews-container');
        reviewsContainer.innerHTML = ''; // 기존 리뷰를 비웁니다.

        reviews.forEach(function (review) {
            var reviewElement = document.createElement('div');
            reviewElement.classList.add('review');

            // 리뷰 내용 구성
            reviewElement.innerHTML = `
                <div class="review-content">
                    <div class="review-header">
                        <div class="review-title">
                            <span class="star-img">${generateStars(review.rate)}</span>
                            <span class="star_score">${review.rate}</span>
                            <h6 id="review_name">${review.user.nickname}</h6>
                        </div>
                        <span class="review-regdate">${formatDate(review.regdate)}</span>
                    </div>
                    <div class="review-text">${review.content}</div>
                    <hr class="review_hr">
                </div>
            `;

            reviewsContainer.appendChild(reviewElement);
        });
    }

    // 별점 이미지를 생성합니다.
    function generateStars(score) {
        var starImgFull = '<img src="/img/review/yellow_star.png" class="star-img">';
        var starImgEmpty = '<img src="/img/review/grey_star.png" class="star-img">';
        var fullStars = starImgFull.repeat(score);
        var emptyStars = starImgEmpty.repeat(5 - score);
        return fullStars + emptyStars;
    }

    // 라디오 버튼 변경 시 리뷰를 다시 정렬하여 렌더링
    $('input[name="sort"]').change(function () {
        var sortType = $(this).val();
        var sortedReviews = sortReviews(reviewsData, sortType);
        renderReviews(sortedReviews);
    });
}


function renderPagination(totalPages) {
    currentPage = 1;
    var paginationContainer = document.getElementById('pagination');
    paginationContainer.innerHTML = ''; // 기존의 내용을 모두 지움

    // 최소한의 버튼 수를 정하는 경우
    var startPage = Math.max(1, currentPage - 2);
    var endPage = Math.min(totalPages, currentPage + 2);

    // 페이지 버튼 추가
    for (var i = startPage; i <= endPage; i++) {
        var pageLi = document.createElement('li');
        pageLi.innerHTML = '<span onclick="changePage(' + i + ')">' + i + '</span>';
        paginationContainer.appendChild(pageLi);
    }

    // 이전 버튼 추가
    // if (currentPage > 1) {
    //     var prevLi = document.createElement('li');
    //     prevLi.innerHTML = '<span onclick="changePage(' + (currentPage - 1) + ')">이전</span>';
    //     paginationContainer.appendChild(prevLi);
    // }

    // 다음 버튼 추가
    // if (currentPage < totalPages) {
    //     var nextLi = document.createElement('li');
    //     nextLi.innerHTML = '<span onclick="changePage(' + (currentPage + 1) + ')">다음</span>';
    //     paginationContainer.appendChild(nextLi);
    // }

}

// 페이지 변경 함수 예시
// function changePage(pageNumber) {
//     // currentPage = pageNumber;
//     // AJAX 요청을 통해 서버에서 해당 페이지의 데이터를 가져옴
//     $.ajax({
//         type: 'GET',
//         url:  "/review/list/" + menu_id + "/" + pageNumber,
//         type: "GET",
//         success: function(response) {
//             // 서버에서 데이터를 성공적으로 가져왔을 때의 처리
//             var reviews = response.list; // 가져온 리뷰 데이터
//             renderReviews(reviews); // 리뷰 데이터를 UI에 반영하는 함수 호출
//
//             // 현재 페이지 번호 업데이트
//             currentPage = pageNumber;
//
//             // 페이징 버튼 업데이트
//             renderPagination(response.totalPages, currentPage);
//         },
//         error: function(error) {
//             console.error('Error fetching reviews:', error);
//         }
//     });
// }

function changePage(pageNumber) {
    // 현재 페이지 번호 업데이트
    currentPage = pageNumber;

    var reviewPrev = $('#reviewPrev');
    var reviewNext = $('#reviewNext');

    // currentPage에 따라 CSS 조절
    if (currentPage > 1) {
        reviewPrev.css('display', 'block'); // 이전 버튼 보이기
    } else {
        reviewPrev.css('display', 'none'); // 이전 버튼 숨기기
    }

    if (currentPage < (parseInt(reviewCount/4)) + 1) {
        reviewNext.css('display', 'block'); // 다음 버튼 보이기
    }else {
        reviewNext.css('display', 'none'); // 다음 버튼 숨기기
    }
    // 해당 페이지의 리뷰를 로드
    loadReviews(currentCocktail, currentPage, 2);
}

function loadReviews(cocktail, page, sort) {
    $.ajax({
        url: "/review/list/" + cocktail.id + "/" + page + "/" + sort,
        type: "GET",
        cache: false,
        success: function (data, status) {
            if (status === "success") {
                // 서버쪽 에러 메세지 있는경우
                if (data.status !== "OK") {
                    // alert(data.status);
                    return;
                }

                // 리뷰 데이터를 UI에 반영하는 함수 호출
                buildReviewSection(data.data);
            }
        },
        error: function(error) {
            console.error('Error fetching reviews:', error);
        }
    });
}

