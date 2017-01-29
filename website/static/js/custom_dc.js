/*============================================================================*/
function reduceAddWeightedAvg(key, attr_weight) {
    return function(p, v) {
        if (v['key'] == key) {
            ++p.count;
            p.sum += v[attr_weight] * v['value'];
            p.weight += v[attr_weight];
            p.avg = p.sum / p.weight;
        }
        return p;
    };
}

function reduceRemoveWeightedAvg(key, attr_weight) {
    return function(p, v) {
        init = reduceInitWeightedAvg();
        if (v['key'] == key) {
            if (p.count > 1) {
                --p.count;
                p.sum -= v[attr_weight] * v['value'];
                p.weight -= v[attr_weight];
                p.avg = p.sum / p.weight;
            } else {
                return init();
            }
        } else {
            return p;
        }
    };
}

function reduceInitWeightedAvg() {
    return function() {
        return {
            count: 0,
            sum: 0,
            weight: 0,
            avg: 0
        };
    }

}

function reduce_add_wavg(global) {
    return function(p, v) {
        ++p.count;
        p.sum_value += v.nbRecipes * v.value;
        p.sum_weight += v.nbRecipes;
        p.avg = p.sum_value / p.sum_weight;
        if (global != null) {
            p.pourcentage = p.avg / global[v.key];
        } else {
            p.pourcentage = p.avg;
        }

        return p;
    };
}

function reduce_remove_wavg(global) {
    return function(p, v) {
        init = reduce_init_wavg();
        --p.count;
        if (p.count == 0) {
            return init();
        } else {
            p.sum_value -= v.nbRecipes * v.value;
            p.sum_weight -= v.nbRecipes;
            p.avg = p.sum_value / p.sum_weight;
            if (global != null) {
                p.pourcentage = p.avg / global[v.key];
            } else {
                p.pourcentage = p.avg;
            }
            return p;
        }
    }
}

function reduce_init_wavg() {
    return function() {
        return {
            count: 0,
            sum_weight: 0,
            sum_value: 0,
            avg: 0,
            pourcentage: 0
        };
    };
}


function reduce_add_sum() {
    return function(p, v) {
        if (v.key == ['avg_readyInMinutes']) {
            ++p.count;
            p.sum_value += v.nbRecipes;
            return p;
        } else {
            return p;
        }
    };
}

function reduce_remove_sum() {
    return function(p, v) {
        if (v.key == ['avg_readyInMinutes']) {
            init = reduce_init_wavg();
            --p.count;
            if (p.count == 0) {
                return init();
            } else {
                p.sum_value -= v.nbRecipes;
                return p;
            }
        } else {
            return p;
        }

    }
}

function reduce_init_avg() {
    return function() {
        return {
            count: 0,
            sum_value: 0
        };
    };
}

function reduce_add_avg(key) {
    return function(p, v) {
        if (v.key == key) {
            ++p.count;
            p.sum_value += v.nbRecipes * v.value;
            p.sum_weight += v.nbRecipes;
            p.avg = p.sum_value / p.sum_weight;
            return p;
        } else {
            return p;
        }
    };
}

function reduce_remove_avg(key) {
    return function(p, v) {
        if (v.key == key) {
            init = reduce_init_wavg();
            --p.count;
            if (p.count == 0) {
                return init();
            } else {
                p.sum_value -= v.nbRecipes * v.value;
                p.sum_weight -= v.nbRecipes;
                p.avg = p.sum_value / p.sum_weight;
                return p;
            }
        } else {
            return p;
        }
    };
}

function reduce_init_sum() {
    return function() {
        return {
            count: 0,
            sum_weight: 0,
            sum_value: 0,
            avg: 0,
        };
    };
}
