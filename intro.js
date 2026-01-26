let intro = sessionStorage.getItem('intro');
let showintro;

if( intro === null ){
  showintro = 'true';
}
else{
  showintro = 'flase';
}

function getintro(){
  if( showintro === 'false' ){
   let a = 0;
   return a;
  }
  else if( showintro === 'true' ){
  }
}

export{ getintro };