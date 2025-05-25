<script>
document.addEventListener("DOMContentLoaded", function() {
  // Populate region dropdown
  var regionOptions = document.querySelectorAll('.region-source');
  var regionSelect = document.getElementById('region-select');
  regionSelect.innerHTML = '<option value="">Select a region</option>';
  regionOptions.forEach(function(option) {
    var opt = document.createElement('option');
    opt.value = option.textContent;
    opt.text = option.textContent;
    regionSelect.appendChild(opt);
  });

  // Prepare subregion data
  var subregionItems = document.querySelectorAll('.subregion-source');
  var subregionSelect = document.getElementById('subregion-select');
  subregionSelect.innerHTML = '<option value="">Select a subregion</option>';

  // Listen for region change
  regionSelect.addEventListener('change', function() {
    var selectedRegion = this.value;
    // Clear subregion dropdown
    subregionSelect.innerHTML = '<option value="">Select a subregion</option>';
    // Add matching subregions
    subregionItems.forEach(function(subregion) {
      var regionRef = subregion.nextElementSibling.textContent;
      if(regionRef === selectedRegion) {
        var opt = document.createElement('option');
        opt.value = subregion.textContent;
        opt.text = subregion.textContent;
        subregionSelect.appendChild(opt);
      }
    });
  });
});
</script>
