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
  // Months needed to reach a savings target with monthly contributions + monthly-compounded interest.
  function savingsGoal(current, monthly, annualRatePct, target){
    current = Math.max(0, Number(current)||0);
    monthly = Math.max(0, Number(monthly)||0);
    annualRatePct = Math.max(0, Number(annualRatePct)||0);
    target = Math.max(0, Number(target)||0);
    var r = annualRatePct/100/12;
    var possible = true, n = 0;
    if (target <= current) { n = 0; }
    else if (monthly <= 0 && r === 0) { possible = false; }
    else if (monthly <= 0) { n = Math.ceil(Math.log(target/current)/Math.log(1+r)); }
    else if (r === 0) { n = Math.ceil((target-current)/monthly); }
    else {
      var need = target*r/monthly + 1, have = current*r/monthly + 1;
      n = Math.ceil(Math.log(need/have)/Math.log(1+r));
    }
    if (n < 0 || !isFinite(n)) { possible = false; n = 0; }
    function balanceAt(m){
      if (r === 0) return current + monthly*m;
      var f = Math.pow(1+r, m);
      return current*f + monthly*(f-1)/r;
    }
    var contributed = current + monthly*n;
    var finalAmt = possible ? balanceAt(n) : 0;
    var interest = possible ? Math.max(0, finalAmt - contributed) : 0;
    var proj = [];
    var years = Math.ceil(n/12);
    for (var y=1; y<=years && y<=40; y++){
      var m = Math.min(y*12, n);
      proj.push({year:y, balance:balanceAt(m), contributed:current + monthly*m});
      if (m >= n) break;
    }
    return {months:n, years:Math.floor(n/12), remMonths:n%12, totalContributed:contributed,
            interestEarned:interest, projectedBalance:finalAmt, possible:possible, projection:proj, _balanceAt:balanceAt};
  }
  // Freelance hourly rate: (target income + expenses) + tax allowance, spread over actual billable hours.
  function freelanceRate(targetIncome, weeksOff, billableHrsPerWeek, expenses, taxPct){
    targetIncome = Math.max(0, Number(targetIncome)||0);
    weeksOff = Math.min(52, Math.max(0, Number(weeksOff)||0));
    billableHrsPerWeek = Math.max(0, Number(billableHrsPerWeek)||0);
    expenses = Math.max(0, Number(expenses)||0);
    taxPct = Math.max(0, Number(taxPct)||0);
    var billableWeeks = 52 - weeksOff;
    var annualHours = billableWeeks * billableHrsPerWeek;
    var possible = annualHours > 0;
    var subtotal = targetIncome + expenses;
    var taxAllowance = subtotal * taxPct / 100;
    var totalNeeded = subtotal + taxAllowance;
    var floorRate = possible ? totalNeeded / annualHours : 0;
    var recommendedRate = floorRate * 1.15;
    var scenarios = [];
    [15,20,25,30,35].forEach(function(h){
      var hrs = billableWeeks * h;
      scenarios.push({hrsPerWeek:h, annualHours:hrs, floor: hrs>0 ? totalNeeded/hrs : 0});
    });
    return {billableWeeks:billableWeeks, annualHours:annualHours,
            subtotal:subtotal, taxAllowance:taxAllowance, totalNeeded:totalNeeded,
            floorRate:floorRate, recommendedRate:recommendedRate,
            monthlyAtFloor:floorRate*annualHours/12, weeklyAtFloor:floorRate*annualHours/52,
            scenarios:scenarios, possible:possible};
  }
  return {budget503020:budget503020, loanEmi:loanEmi, analyzeText:analyzeText, passwordEntropy:passwordEntropy, strengthLabel:strengthLabel, savingsGoal:savingsGoal, freelanceRate:freelanceRate};
})();
if (typeof module !== 'undefined' && module.exports) { module.exports = Core; }
