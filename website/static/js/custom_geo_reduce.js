/* =============================================================================
  GEO REDUCTION
============================================================================= */

function reduce_add_geo(meta_key, global) {
    return function(p, v) {
        ++p[v.key].count;
        p[v.key].sum_value += v.nbRecipes * v.value;
        p[v.key].sum_weight += v.nbRecipes;
        p[v.key].avg = p[v.key].sum_value / p[v.key].sum_weight;
        if (global != null) {
            p[v.key].value = p[v.key].avg / global[v.key];
        } else {
            p[v.key].value = p[v.key].avg;
        }


        update_final_value(p, v)
        return p;
    }
}

function reduce_remove_geo(meta_key, global) {
    return function(p, v) {
        /*
          init = reduce_init_geo(meta_key, global);
          --p[v.key].count;
          if (p[v.key].count <= 0) {
              console.log("test")
              p = init();
          } else {
              p[v.key].sum_value -= v.nbRecipes * v.value;
              p[v.key].sum_weight -= v.nbRecipes;
              p[v.key].avg = p[v.key].sum_value / p[v.key].sum_weight;
              p[v.key].value = p[v.key].avg / global[v.key];
          }
          update_final_value(p, v)
          */
        p[v.key].count = 0;
        p[v.key].sum_value = 0;
        p[v.key].sum_weight = 0;
        p[v.key].avg = 0;
        p[v.key].value = 0;
        update_final_value(p, v)
        return p;
    }
}

function reduce_init_geo(meta_key, global) {
    return function() {
        init = {};
        // add field information
        for (var key in meta_key) {
            init[key] = base_structure();
        }
        // add final information
        init['final'] = {
            count: 0,
            sum_value: 0,
            sum_weight: 0,
            avg: 0,
            value: 0
        }
        return init;
    }
}

function base_structure() {
    return {
        count: 0,
        sum_value: 0,
        sum_weight: 0,
        avg: 0,
        value: 0
    }
}

/* =============================================================================
  REDUCTION RULE
============================================================================= */

function update_final_value(p, v) {
    var count_sum = 0;
    var selected_key = null;
    for (var key in p) {
        if (p[key].count > 0) {
            count_sum++;
        } else {
            // DO NOTHING
        }

        if (p[key].count > 0) {
            selected_key = key;
        }
    }
    if (count_sum == 1) {
        p.final.value = p[selected_key].value;
        p.final.key = selected_key;
    } else {

        p.final.value = v['nbRecipes'];
        p.final.key = null;
    }
}
