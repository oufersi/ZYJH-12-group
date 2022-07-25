console.inspectEnable = true;
import LightKV from 'lightkv';

const sceneDB = new LightKV('scene.lkv', 'c+', LightKV.OBJECT);

/**
 * {
 *    devids: string[];
 *    label: string
 *    points: number[]
 * }
 */
const obj: { devids: string[]; setting :{id: string; limit: number} } = Object.fromEntries(
  sceneDB.toMap() as Array<any>
) as any;

console.info('[water db]:', obj);

// 数据库set仅可通过一级 = 赋值
// 一级属性
const db = new Proxy(obj, {
  get: (target, key, receiver): string[] => {
    return Reflect.get(target, key, receiver) || [];
  },

  set: (target, key, value, receiver) => {
    try {
      updateDB(key, value);
      return Reflect.set(target, key, value, receiver);
    } catch (error) {
      console.error('Failed to modify database');
      throw error;
    }
  }
});

function initDB() {
  try {
    if (!db.devids) {
      db.devids = [];
    }
    if (!db.setting) {
      db.setting = { id: 'Custom', limit: 60 }; // 默认自定义
    }
  } catch (error) {
    // console.error(error)
    throw new Error('init database error');
  }
}

initDB()

function updateDB(key, value) {
  try {
    sceneDB.begin();
    sceneDB.set(key, value);
    sceneDB.commit();
  } catch (error) {
    sceneDB.rollback();
    throw new Error('修改数据库失败！');
  }
}

export default db;
