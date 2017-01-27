function reduceAddWeightedAvg(attr_value, attr_weight) {
    return function(p, v) {
        ++p.count;
        p.sum += v[attr_weight] * v[attr_value];
        p.weight += v[attr_weight];
        p.avg = p.sum / p.weight;
        return p;
    };
}

function reduceRemoveWeightedAvg(attr_value, attr_weight) {
    return function(p, v) {

        if (p.count <= 1) {
            return reduceRemoveWeightedAvg();
        } else {
            --p.count;
            p.sum -= v[attr_weight] * v[attr_value];
            p.weight -= v[attr_weight];
            p.avg = p.sum / p.weight;
            return p;
        }
    };
}

function reduceInitWeightedAvg() {
    return {
        count: 0,
        sum: 0,
        weight: 0,
        avg: 0
    };
}

/*============================================================================*/
function reduceAddWeightedAvg2(key, attr_weight) {
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

function reduceRemoveWeightedAvg2(key, attr_weight) {
    return function(p, v) {
        if (v['key'] == key) {
            if (p.count > 1) {
                --p.count;
                p.sum -= v[attr_weight] * v['value'];
                p.weight -= v[attr_weight];
                p.avg = p.sum / p.weight;
            } else {
                return reduceRemoveWeightedAvg2();
            }
        } else {
            return p;
        }
    };
}

function reduceInitWeightedAvg2() {
    return {
        count: 0,
        sum: 0,
        weight: 0,
        avg: 0
    };
}

function reduce_add_wavg(data) {
    return function(p, v) {
        ++p.count;
        p.sum_value += v.nbRecipes * v.value;
        p.sum_weight += v.nbRecipes;
        p.avg = p.sum_value / p.sum_weight;
        p.pourcentage = p.avg / data[v.key];
        return p;
    };
}

function reduce_remove_wavg(data) {
    return function(p, v) {
        init = reduce_init_wavg();
        --p.count;
        if (p.count == 0) {
            return init();
        } else {
            p.sum_value -= v.nbRecipes * v.value;
            p.sum_weight -= v.nbRecipes;
            p.avg = p.sum_value / p.sum_weight;
            p.pourcentage = p.avg / data[v.key];
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
