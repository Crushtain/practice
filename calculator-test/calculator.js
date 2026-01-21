const math = require('mathjs');

// ------------------------------------------------
// 1. ФУНКЦИИ ДЛЯ ДАВЛЕНИЯ НАСЫЩЕНИЯ (ГОФФ-ГРАТЧ)
// ------------------------------------------------

function p_sat_goff_gratch(t_c) {
    const T_k = t_c + 273.15;
    if (T_k <= 0) return 0.0;

    let log_psat_mbar;
    if (t_c >= 0.0) {
        const c1 = -7.90298 * (373.16 / T_k - 1.0);
        const c2 = 5.02808 * Math.log10(373.16 / T_k);
        const c3 = -1.3816e-7 * (Math.pow(10, 11.344 * (1 - T_k / 373.16)) - 1);
        const c4 = 8.1328e-3 * (Math.pow(10, -3.49149 * (373.16 / T_k - 1)) - 1);
        const c5 = Math.log10(1013.246);
        log_psat_mbar = c1 + c2 + c3 + c4 + c5;
    } else {
        const c1 = -9.09718 * (273.16 / T_k - 1.0);
        const c2 = -3.56654 * Math.log10(273.16 / T_k);
        const c3 = 0.87682;
        const c4 = Math.log10(6.1071);
        log_psat_mbar = c1 + c2 + c3 + c4;
    }

    const p_sat_mbar = Math.pow(10, log_psat_mbar);
    const p_sat_kpa = p_sat_mbar / 10.0;
    return p_sat_kpa > 0 ? p_sat_kpa : 0.0;
}

// ------------------------------------------------
// 2. ПРОЧИЕ УПРОЩЁННЫЕ КОНСТАНТЫ И ФОРМУЛЫ
// ------------------------------------------------

const CP_DRY = 1.005; // кДж/(кг·K)
const CP_VAP = 1.84;   // кДж/(кг·K)

function r_linear(t_c) {
    return 2501.0 - 2.37 * t_c;
}

function enthalpy(t_c, omega_gkg) {
    const w_kgkg = omega_gkg / 1000.0;
    return (CP_DRY * t_c) + w_kgkg * (r_linear(t_c) + CP_VAP * t_c);
}

function cp_moist(t_c, omega_gkg) {
    return CP_DRY + (omega_gkg / 1000.0) * CP_VAP;
}

function dew_point_bisection(pv_kpa) {
    let left = -90.0, right = 60.0;
    if (pv_kpa <= 0) return left;
    for (let i = 0; i < 100; i++) {
        const mid = (left + right) / 2;
        const psat_mid = p_sat_goff_gratch(mid);
        if (Math.abs(psat_mid - pv_kpa) < 1e-5) return mid;
        if (psat_mid < pv_kpa) left = mid;
        else right = mid;
        //console.log("Итерация:", i, "Левая граница:", left, "Правая граница:", right, "Среднее:", mid, "Psat(mid):", psat_mid);
    }
    return (left + right) / 2;
}

// ------------------------------------------------
// 3. СИСТЕМА УРАВНЕНИЙ И РЕШАТЕЛЬ
// ------------------------------------------------

function buildEquations(known) {
    const allKeys = ['T', 'varphi', 'pv', 'w', 'h', 'tdp'];
    const unknown = allKeys.filter(k => !(k in known));
    const eqFuncs = [];

    // E1: pv = (varphi / 100) * psat(T)
    if (['pv', 'varphi', 'T'].some(k => !(k in known))) {
        eqFuncs.push(vars => vars.pv - (vars.varphi / 100) * p_sat_goff_gratch(vars.T));
    }

    // E2: w = 622 * (pv / (p - pv))
    if (['w', 'pv'].some(k => !(k in known))) {
        eqFuncs.push(vars => {
            const p = known.p;
            if (Math.abs(p - vars.pv) < 1e-10) return 999999.0; // Избегаем деления на ноль
            return vars.w - 622 * (vars.pv / (p - vars.pv));
        });
    }

    // E3: psat(tdp) = pv
    if (['tdp', 'pv'].some(k => !(k in known))) {
        eqFuncs.push(vars => p_sat_goff_gratch(vars.tdp) - vars.pv);
    }

    // E4: h = c_p,dry * T + (w / 1000) * (r(T) + c_p,vap * T)
    if (['h', 'T', 'w'].some(k => !(k in known))) {
        eqFuncs.push(vars => vars.h - enthalpy(vars.T, vars.w));
    }

    return { unknown, eqFuncs };
}

function solveSystem(known) {
    if (!('p' in known)) return { error: "Не задано полное давление p." };

    const allParams = ['T', 'varphi', 'pv', 'w', 'h', 'tdp'];
    const keysInKnown = allParams.filter(k => k in known);
    if (keysInKnown.length < 2) return { error: "Недостаточно данных." };

    const { unknown, eqFuncs } = buildEquations(known);
    //if (unknown.length !== eqFuncs.length) return { error: "Несоответствие уравнений." };

    // Начальные значения только для неизвестных параметров
    const guess = { T: 0, varphi: 0, pv: 0, w: 0, h: 0, tdp: 0 };
    const x0 = unknown.map(k => guess[k]);

    const F = (x) => {
        const vars = { ...known };
        unknown.forEach((k, i) => vars[k] = x[i]);

        const residuals = [];
        if ('pv' in unknown || 'varphi' in unknown || 'T' in unknown) {
            const psat = p_sat_goff_gratch(vars.T);
            residuals.push(vars.pv - (vars.varphi / 100) * psat);
        }
        if ('w' in unknown || 'pv' in unknown) {
            const p = known.p;
            if (Math.abs(p - vars.pv) < 1e-10) {
                residuals.push(999999.0); // Избегаем деления на ноль
            } else {
                residuals.push(vars.w - 622 * (vars.pv / (p - vars.pv)));
            }
        }
        if ('tdp' in unknown || 'pv' in unknown) {
            residuals.push(p_sat_goff_gratch(vars.tdp) - vars.pv);
        }
        if ('h' in unknown || 'T' in unknown || 'w' in unknown) {
            residuals.push(vars.h - enthalpy(vars.T, vars.w));
        }
        if ('T' in unknown) {
            const omega = 622 * (sol.pv / (sol.p - sol.pv));
            sol.T = (sol.h - (omega / 1000) * 2501) / (1.005 + (omega / 1000) * (1.84 - 2.37));
        }

        return residuals;
    };

    if (!Array.isArray(x0)) {
        return { error: "Начальное приближение x0 не является массивом." };
    }

    const result = newtonSolve(F, x0);
    if (!result.success) return { error: result.message };

    const sol = { ...known };
    unknown.forEach((k, i) => sol[k] = result.x[i]);

    return { sol };
}

function newtonSolve(F, x0, maxIter = 100, tol = 1e-6) {
    if (!Array.isArray(x0)) {
        return { success: false, message: "x0 должен быть массивом" };
    }

    let x = [...x0];
    const n = x.length;
    let lambda = 0.001; // Параметр регуляризации

    for (let iter = 0; iter < maxIter; iter++) {
        const fx = F(x);
        const norm = math.norm(fx);
        if (norm < tol) {
            return { x, success: true };
        }

        // Создание матрицы Якоби
        const J = math.zeros(n, n);
        for (let i = 0; i < n; i++) {
            const xh = [...x];
            xh[i] += 1e-4; // Шаг дифференцирования
            const fh = F(xh);
            for (let j = 0; j < n; j++) {
                J.set([j, i], (fh[j] - fx[j]) / 1e-4);
            }
        }

        try {
            // Регуляризация: J^T * J + lambda * I
            const JT = math.transpose(J);
            const JTJ = math.multiply(JT, J);
            const I = math.identity(n);
            const JTJ_regularized = math.add(JTJ, math.multiply(lambda, I));

            // Решение (JTJ + lambda*I) * dx = -J^T * fx
            const rhs = math.multiply(JT, math.multiply(fx, -1));
            const dx = math.lusolve(JTJ_regularized, rhs);

            // Обновление решения с ограничениями
            for (let i = 0; i < n; i++) {
                x[i] = Math.max(Math.min(x[i] + dx[i], 100), -100); // Ограничения
            }
            lambda *= 0.5; // Уменьшаем lambda при успехе
        } catch (e) {
            lambda *= 10; // Увеличиваем lambda при ошибке
            if (lambda > 1e6) {
                return { x, success: false, message: "Не удается стабилизировать матрицу" };
            }
        }
    }

    return { x, success: false, message: "Достигнут лимит итераций" };
}

// ------------------------------------------------
// 4. ПРИМЕР ИСПОЛЬЗОВАНИЯ
// ------------------------------------------------

const knownInput = { // НЕЛЬЗЯ: а) !T && !h    б) !varphi && !pv
    p: 101.325, //Полное давление:
    //varphi: 45, //Отн. влажность:
    pv: 3.25, //Парциальное давление:
    T: 10, //Температура:
    //w: 26, //Влагосодержание:
    //h: 63.606,//Энтальпия:
    //tdp: 9.273, //Точка росы:
    //cp_moist_value: 0 //Удельная теплоёмкость:
};

if (knownInput.p <= 0 || knownInput.varphi < 0 || knownInput.varphi > 100) {
    throw new Error("Некорректные входные данные");
}

const result = solveSystem(knownInput);


if (result.error) {
    console.error("Ошибка:", result.error);
} else {
    const sol = result.sol;

    // Вычисляем недостающие параметры
    if (!sol.pv) {
        sol.pv = (sol.varphi / 100) * p_sat_goff_gratch(sol.T);
    }
    if (!sol.varphi) {
        const psat = p_sat_goff_gratch(sol.T);
        sol.varphi = (sol.pv / psat) * 100;
    }
    if (!sol.w) {
        sol.w = 622 * (sol.pv / (sol.p - sol.pv));
    }
        sol.h = enthalpy(sol.T, sol.w);
        sol.tdp = dew_point_bisection(sol.pv);
        const cp_moist_value = cp_moist(sol.T, sol.w); // Удельная теплоёмкость


    // Форматируем вывод
    console.log("Результаты:");
    console.log(`Полное давление: ${sol.p.toFixed(3)} кПа`);
    console.log(`Температура: ${sol.T.toFixed(4)} °C`);
    console.log(`Отн. влажность: ${sol.varphi.toFixed(4)} %`);
    console.log(`Парциальное давление: ${sol.pv.toFixed(4)} кПа`);
    console.log(`Влагосодержание: ${sol.w.toFixed(4)} г/кг`);
    console.log(`Энтальпия: ${sol.h.toFixed(4)} кДж/кг`);
    console.log(`Точка росы: ${sol.tdp.toFixed(4)} °C`);
    console.log(`Удельная теплоёмкость: ${cp_moist_value.toFixed(4)} кДж/(кг·K)`);
}