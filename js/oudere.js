(function () {
  var form = document.getElementById('somform');
  if (!form) return;
  var DOEL = 'https://jessevanas-commits.github.io/sprite-fright-nl/#film';
  var uit = document.getElementById('somuitkomst');
  var veld = document.getElementById('som');
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (veld.value.trim() === String(5 * 5)) {
      uit.innerHTML = 'Juist! <a class="knop knop--oranje" href="' + DOEL + '" target="_blank" rel="noopener">Open de film</a>';
      uit.className = 'som__uitkomst som__uitkomst--goed';
      var a = uit.querySelector('a'); if (a) a.focus();
    } else {
      uit.textContent = 'Dat is niet juist. Probeer het nog eens!';
      uit.className = 'som__uitkomst som__uitkomst--fout';
      veld.select();
    }
  });
})();
