const { Op } = require('sequelize');

const MAX_FUEL       = 160;            // «полный бак»
const FUEL_COST      = 20;             // списывается при создании квиза
const REGEN_INTERVAL = 8 * 60 * 1000;  // 1 ⚡ каждые 8 минут (8 минут)

/**
 * Возвращает актуальное количество ⚡, НЕ сохраняя в БД.
 */
function getCurrentFuel(user) {
  const last   = user.fuel_updated_at ?? user.updated_at;
  const passed = Date.now() - new Date(last).getTime();
  const ticks  = Math.floor(passed / REGEN_INTERVAL);
  return Math.min(MAX_FUEL, user.fuel + ticks);
}

/**
 * Синхронизирует счётчик с БД, если «натикало» ≥ 1 ⚡.
 * Возвращает объект user с актуальными значениями fuel / fuel_updated_at.
 */
async function syncFuel(user) {
  const last   = user.fuel_updated_at ?? user.updated_at;
  const diff   = Date.now() - new Date(last).getTime();
  const gained = Math.floor(diff / REGEN_INTERVAL);

  if (gained <= 0 || user.fuel >= MAX_FUEL) return user;

  const newFuel  = Math.min(MAX_FUEL, user.fuel + gained);
  const newStamp = new Date(+last + gained * REGEN_INTERVAL);

  await user.update({ fuel: newFuel, fuel_updated_at: newStamp });
  return Object.assign(user, { fuel: newFuel, fuel_updated_at: newStamp });
}

/**
 * Списывает `amount` ⚡. Бросает ошибку, если баланса недостаточно.
 * Можно вызвать внутри транзакции (`transaction` передаётся опционально).
 */
async function consumeFuel(user, amount, transaction = null) {
  await syncFuel(user);

  if (user.fuel < amount) throw new Error('Not enough fuel');

  const newFuel  = user.fuel - amount;
  const newStamp = new Date();

  await user.update(
    { fuel: newFuel, fuel_updated_at: newStamp },
    { transaction }
  );

  return Object.assign(user, { fuel: newFuel, fuel_updated_at: newStamp });
}

module.exports = { MAX_FUEL, FUEL_COST, getCurrentFuel, syncFuel, consumeFuel };