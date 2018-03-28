Tile = function (element) {
    return {
        "mine" : element.mine,
        "flagged" : element.classList.contains("flag"),
        "unseen" : element.classList.contains("unseen")
    }
}