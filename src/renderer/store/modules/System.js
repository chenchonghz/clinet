const fs = require('fs');
const state = {
  // 页面工具栏选择
  toolbar: '',
  // 选择目录下的CSV文件列表
  files: [],
  // 选择要导入的CSV文件
  file: [],
  // 系统内置的table列表
  tables: [],
  // 选择要处理的table
  table: [],
  // 选择要处理的field
  field: [],
  fieldIndex: null,
  server: '',
  port: '',
  // 用户创建信息
  registerInfo: [],
  // 连接状态
  connectInfo: false,
  // 用户状态
  user: { username: '', org: '', type: 2, login: false },
  // 机构信息
  orgs: [],
  org: [],
  orgInfo: { code: '', name: '', level: '', type: '', province: '', city: '', county: '', person_name: '', tel: '', email: '' },
  // 科室信息
  departments: [],
  department: [],
  departmentInfo: { org: '', cherf_department: '', class: '', department: '', is_imp: false, is_spe: false, professor: '', wt_code: '', wt_name: '' },
  wt4: [],
  wt4Page: 0,
  wt4Files: [],
  wt4File: [],
  wt4Table: [],
  wt4Row: [],
  wt4Comp: [],
  wt4LocalRow: [],
  comprule: [],
  localPage: 0,
  wt4Tables: [],
  wt4TablePage: 0,
  targetIndex: [],
  targetDimension: [],
  serverStat: { wt4: [], index: [], dimension: [] },
  serverTable: '',
  // tableType: 'local',
  computeVersion: ['CN', 'GB', 'BJ'],
  computeData: '',
  province: {},
  orgPage: 'getOrg',
  userPower: null,
  persons: {},
  pageInfo: { org: '1', department: '1' }
};

const mutations = {
  SYSTEM_SET_TOOLBAR(state, toolbar) {
    state.toolbar = toolbar;
  },
  SYSTEM_SET_SERVER(state, m) {
    state.server = m[1];
    state.port = m[2];
  },
  SYSTEM_SET_SERVER_STATUS(state, m) {
    const a = state.file[m[0]]
    const b = a.split(',')
    b.splice(3, 1, m[1])
    state.file.splice(m[0], 1, b.join(','))
    if (m[1] === '连接成功') {
      state.connectInfo = true
    } else {
      state.connectInfo = false
    }
  },
  SYSTEM_SET_CONNECT_INFO(state, r) {
    state.connectInfo = r
  },
  SYSTEM_GET_FILES(state) {
    state.files = fs.readdirSync(global.hitbdata.path.home).filter(x => x.endsWith('.csv'))
  },
  SYSTEM_LOAD_FILE(state, file) {
    state.file = file;
  },
  SYSTEM_GET_TABLES(state, tables) {
    state.tables = tables;
  },
  SYSTEM_GET_TABLE(state, table) {
    state.table = table;
  },
  SYSTEM_GET_FIELD(state, field) {
    state.field = field;
  },
  SYSTEM_GET_FIELD_INDEX(state, index) {
    state.fieldIndex = index;
  },
  SYSTEM_SET_TABLE(state, field) {
    if (state.table[state.fieldIndex].length > 5) {
      state.table[state.fieldIndex].pop()
    }
    state.table[state.fieldIndex].push(field)
    state.table = state.table;
  },
  // 用户注册
  SYSTEM_REGISTER_USER(state, field) {
    state.registerInfo = field
  },
  // 用户登录
  SYSTEM_SET_USER(state, field) {
    state.user = field[1];
    state.userPower = field[1].type
  },
  // 用户信息
  SYSTEM_INFO_USER(state, field) {
    state.user = field[1]
  },
  // 获取机构信息
  SYSTEM_GET_ORGS(state, field) {
    state.orgs = field
  },
  // 更新单个机构信息
  SYSTEM_NEW_ORG(state, field) {
    state.org = field
  },
  // 获取科室信息
  SYSTEM_GET_DEPARTMENTS(state, field) {
    state.departments = field
  },
  // 更新单个科室信息
  SYSTEM_NEW_DEPARTMENT(state, field) {
    state.department = field
  },

  SYSTEM_GET_ORG_INFO(state, field) {
    state.orgInfo = field
  },
  SYSTEM_GET_DEPARTMENT_INFO(state, field) {
    state.departmentInfo = field
  },
  // 获取wt4信息
  SYSTEM_SET_WT4(state, field) {
    state.wt4 = field[0]
  },
  // 获取wt4行高亮
  SYSTEM_GET_WT4ROW(state, field) {
    if (state.wt4Row.includes(field)) {
      state.wt4Row.splice(state.wt4Row.findIndex(v => v === field), 1)
    } else {
      state.wt4Row = [...state.wt4Row, field]
    }
  },
  // 获取wt4分组信息
  SYSTEM_GET_WT4_COMP(state, field) {
    state.wt4Comp.forEach((n, index) => {
      if (n[0].B_WT4_V1_ID === field[0].B_WT4_V1_ID && n[0].version === field[0].version) {
        state.wt4Comp.splice(index, 1)
      }
    })
    state.wt4Comp = [...state.wt4Comp, field]
  },
  // 读取本地wt4文件目录
  SYSTEM_LOAD_WT4_FILES() {
    const files = fs.readdirSync(global.hitbdata.path.stat).filter(x => x.endsWith('.csv'))
    state.wt4Files = files;
  },
  // 读取本地wt4文件
  SYSTEM_LOAD_WT4_FILE(state, message) {
    state.wt4File = message;
    // 按照,号切字符
    message = message.map(x => x.split(','))
    // 取得表头
    const header = message[0]
    const objs = []
    // 去除表头
    message.splice(0, 1)
    // 生成obj
    message.forEach((xs) => {
      const obj = {}
      xs.forEach((x, i) => {
        obj[header[i]] = x;
      })
      objs.push(obj);
    })
    state.wt4Table = objs
    state.wt4TablePage = Math.floor(objs.length / 10)
  },
  // 翻页
  SYSTEM_SET_LOCAL_PAGE(state, field) {
    if (field === undefined) {
      field = 0
    }
    switch (field) {
      case 'up':
        state.localPage -= 1
        break;
      case 'down':
        state.localPage += 1
        break;
      default:
        state.localPage = parseInt(field, 10)
    }
    state.wt4Tables = state.wt4Table.slice(state.localPage * 10, (state.localPage * 10) + 10);
  },
  // 获取wt4本地文件高亮
  SYSTEM_GET_WT4_LOCAL_ROW(state, field) {
    if (state.wt4LocalRow.includes(field)) {
      state.wt4LocalRow.splice(state.wt4LocalRow.findIndex(v => v === field), 1)
    } else {
      state.wt4LocalRow = [...state.wt4LocalRow, field]
    }
  },
  // 获取分组规则
  SYSTEM_GET_COMPRULE(state, field) {
    const keys = field[0].data.map((value, index) => [value.code, index])
    const value = keys.sort().map(value => field[0].data[value[1]])
    state.comprule = value;
  },
  // 获取计算维度
  SYSTEM_GET_TARGET(state, field) {
    state.targetIndex = field.index
    state.targetDimension = field.dimension
  },
  // 或计算数据
  SYSTEM_GET_SERVER_STAT(state, field) {
    if (state.serverStat[field[0]].includes(field[1])) {
      state.serverStat[field[0]].splice(state.serverStat[field[0]].findIndex(v => v === field[1]), 1)
    } else {
      state.serverStat[field[0]] = [...state.serverStat[field[0]], field[1]]
    }
  },
  SYSTEM_SET_SERVER_TABLE(state, field) {
    state.serverTable = field
  },
  SYSTEM_UPLOAD_FILE(state, field) {
    console.log(field);
  },
  // SYSTEM_TABLE_TYPE(state, field) {
  //   state.tableType = field;
  // },
  SYSTEM_SET_COMPUTE_DATA(state, value) {
    state.computeData = value;
  },
  SYSTEM_PROVINCE(state, value) {
    state.province = value
  },
  SYSTEM_GET_ORGPAGE(state, value) {
    state.orgPage = value
  },
  // 获取人员设置信息
  SYSTEM_GET_USERS(state, value) {
    state.persons = value
  },
  // 获取机构设置页面信息
  SYSTEM_GET_PAGEINFO(state, value) {
    switch (state.orgPage) {
      case 'getDepartment':
        state.pageInfo.department = value
        break;
      case 'getOrg':
        state.pageInfo.org = value
        break;
      default:
    }
  },
  // 本地wt4搜索
  SYSTEM_SET_SEARCH(state, value) {
    const array = state.wt4Table.map(n => Object.values(n))
    const wt4Tables = []
    array.forEach((n, index) => {
      if ([n[4], n[75], n[16], n[54], n[83], n[82], n[47], n[48], n[19], n[62], n[20]].includes(value)) {
        wt4Tables.push(state.wt4Table[index])
      }
    })
    state.wt4TablePage = Math.floor(wt4Tables.length / 10)
    state.wt4Tables = wt4Tables.slice(state.localPage * 10, (state.localPage * 10) + 10);
  }
};

const actions = {
  someAsyncTask({ commit }) {
    commit('SYSTEM_SET_TOOLBAR');
    commit('SYSTEM_GET_FILES');
    commit('SYSTEM_LOAD_FILE');
    commit('SYSTEM_GET_TABLES');
    commit('SYSTEM_GET_TABLE');
    commit('SYSTEM_GET_FIELD');
    commit('SYSTEM_SET_TABLE');
    commit('SYSTEM_SET_SERVER');
    commit('SYSTEM_SET_SERVER_STATUS');
    commit('SYSTEM_REGISTER_USER');
    commit('SYSTEM_SET_USER');
    commit('SYSTEM_INFO_USER');
    commit('SYSTEM_GET_ORGS');
    commit('SYSTEM_NEW_ORG');
    commit('SYSTEM_GET_DEPARTMENTS');
    commit('SYSTEM_NEW_DEPARTMENT');
    commit('SYSTEM_GET_ORG_INFO');
    commit('SYSTEM_GET_DEPARTMENT_INFO');
    commit('SYSTEM_SET_WT4');
    commit('SYSTEM_LOAD_WT4_FILES');
    commit('SYSTEM_LOAD_WT4_FILE');
    commit('SYSTEM_GET_WT4ROW');
    commit('SYSTEM_GET_WT4_COMP');
    commit('SYSTEM_GET_WT4_LOCAL_ROW');
    commit('SYSTEM_SET_LOCAL_PAGE');
    commit('SYSTEM_GET_TARGET');
    commit('SYSTEM_GET_SERVER_STAT');
    commit('SYSTEM_SET_SERVER_TABLE');
    // commit('SYSTEM_TABLE_TYPE');
    commit('SYSTEM_SET_COMPUTE_DATA');
    commit('SYSTEM_PROVINCE');
    commit('SYSTEM_GET_ORGPAGE');
    commit('SYSTEM_GET_USERS');
    commit('SYSTEM_GET_PAGEINFO');
    commit('SYSTEM_SET_SEARCH');
  },
};

export default {
  state,
  mutations,
  actions,
};
