const toggleLoader = (loaderId, state) => {
    const loaderDisplay = document.getElementById(loaderId).style;
    state ? loaderDisplay.display = 'flex' : 'none';
}

const toggleDivLoader = (divId, divDisplay, loaderId, state) => {
    const div = document.getElementById(divId).style;
    const loaderDisplay = document.getElementById(loaderId).style;
    if (state) {
        loaderDisplay.display = 'flex'
        div.display = 'none'
    } else {
        loaderDisplay.display = 'none'
        div.display = divDisplay
    }
}