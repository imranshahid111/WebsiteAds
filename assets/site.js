// {{BRAND}} shared helpers — copy buttons, input niceties. No dependencies.
function copyText(text, btn) {
  var done = function(){ if(btn){ var o=btn.textContent; btn.textContent='Copied ✓'; setTimeout(function(){btn.textContent=o;},1600);} };
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(done, function(){ fallbackCopy(text); done(); });
  } else { fallbackCopy(text); done(); }
}
function fallbackCopy(text){
  var ta=document.createElement('textarea'); ta.value=text; ta.style.position='fixed'; ta.style.opacity='0';
  document.body.appendChild(ta); ta.select();
  try{ document.execCommand('copy'); }catch(e){}
  document.body.removeChild(ta);
}
function fmtUSD(n){ return '$' + Number(n).toLocaleString('en-US',{maximumFractionDigits:2,minimumFractionDigits:2}); }
function clamp(n,min,max){ return Math.min(max, Math.max(min, n)); }
// Shared core math so it can be unit-tested in Node without a DOM.
var Core = (function(){
  function budget503020(income){
    income = Math.max(0, Number(income)||0);
    var needs=income*0.50, wants=income*0.30, save=income*0.20;
    return {needs:needs, wants:wants, save:save, yearlyNeeds:needs*12, yearlyWants:wants*12, yearlySave:save*12};
  }
  function loanEmi(principal, annualRatePct, years){
    principal=Math.max(0,Number(principal)||0); annualRatePct=Math.max(0,Number(annualRatePct)||0); years=Math.max(0.25,Number(years)||0);
    var n=Math.round(years*12), r=annualRatePct/100/12, emi;
    if(r===0){ emi=principal/n; } else { var f=Math.pow(1+r,n); emi=principal*r*f/(f-1); }
    var total=emi*n, interest=total-principal;
    // yearly amortization summary
    var rows=[], bal=principal;
    for(var y=1;y<=years && bal>0.001;y++){
      var yInt=0, yPrin=0;
      for(var m=0;m<12 && bal>0.001;m++){
        var i=bal*r, p=emi-i;
        if(p>bal){ p=bal; i=emi-p; }
        yInt+=i; yPrin+=p; bal-=p;
      }
      rows.push({year:y, interest:yInt, principal:yPrin, balance:Math.max(0,bal)});
    }
    return {emi:emi, total:total, interest:interest, months:n, schedule:rows};
  }
  function analyzeText(text){
    text = text || '';
    var chars = text.length;
    var charsNoSpace = text.replace(/\s/g,'').length;
    var words = (text.trim().match(/\S+/g) || []).length;
    var sentences = (text.match(/[^.!?]+[.!?]+/g) || []).length;
    var paragraphs = text.split(/\n\s*\n/).filter(function(p){return p.trim().length>0;}).length;
    if(text.trim().length>0 && paragraphs===0) paragraphs=1;
    var readMin = words/200, speakMin = words/130;
    return {words:words, chars:chars, charsNoSpace:charsNoSpace, sentences:sentences, paragraphs:paragraphs, readMin:readMin, speakMin:speakMin};
  }
  function passwordEntropy(length, poolSize){
    return (Number(length)||0) * Math.log2(poolSize||1);
  }
  function strengthLabel(bits){
    if(bits<40) return {label:'Weak', color:'#dc2626', pct:25};
    if(bits<60) return {label:'Fair', color:'#d97706', pct:50};
    if(bits<80) return {label:'Strong', color:'#16a34a', pct:75};
    return {label:'Very strong', color:'#1d4ed8', pct:100};
  }
  return {budget503020:budget503020, loanEmi:loanEmi, analyzeText:analyzeText, passwordEntropy:passwordEntropy, strengthLabel:strengthLabel};
})();
if (typeof module !== 'undefined' && module.exports) { module.exports = Core; }
