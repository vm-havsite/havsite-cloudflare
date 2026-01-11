const isnew = localStorage.getItem("new");
let pointsbalance;

if( isnew === null ){  // Use === for safety
  localStorage.setItem("points", '6');
  localStorage.setItem("new", "no");
  pointsbalance = 6;
}
else if( isnew === "no" ){  // Use === for safety
  pointsbalance = parseInt(localStorage.getItem("points"));
}

function getpoints(){
  return pointsbalance;  // ✓ Fixed
}

function addpoints(addval){
  var val = pointsbalance + addval;
  localStorage.setItem("points", `${val}`);
  pointsbalance = parseInt(localStorage.getItem("points"));
}

function subpoints(subval){
  var val = pointsbalance - subval;
  localStorage.setItem("points", `${val}`);
  pointsbalance = parseInt(localStorage.getItem("points"));
}

export{ getpoints, addpoints, subpoints };