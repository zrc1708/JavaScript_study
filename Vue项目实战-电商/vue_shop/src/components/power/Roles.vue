<template>
    <div>
        <!-- 面包屑导航-->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>权限管理</el-breadcrumb-item>
            <el-breadcrumb-item>角色列表</el-breadcrumb-item>
        </el-breadcrumb>
        <!-- 卡片视图 -->
        <el-card>
            <el-row>
                <el-col>
                    <el-button type="primary">添加角色</el-button>
                </el-col>
            </el-row>
            <!-- 角色列表 -->
            <el-table :data="roleList" border stripe>
                <el-table-column type="expand">
                    <template slot-scope="scope">
                        <el-row class="vcenter" :class="['bdbottom',i1===0 ?'bdtop':'']" v-for="(item1, i1) in scope.row.children" :key="item1.id">
                            <!-- 渲染一级权限 -->
                            <el-col :span="5">
                                <el-tag closable @close="removeRightById(scope.row,item1.id)">{{item1.authName}}</el-tag>
                                <i class="el-icon-caret-right"></i>
                            </el-col>
                            <!-- 渲染二级和三级权限 -->
                            <el-col :span="19">
                                <!-- 渲染二级权限 -->
                                <el-row class="vcenter" :class="[i2===0 ?'':'bdtop']" v-for="(item2, i2) in item1.children" :key="i2">
                                    <el-col :span="6">
                                        <el-tag closable @close="removeRightById(scope.row,item2.id)" type="success">{{item2.authName}}</el-tag>
                                        <i class="el-icon-caret-right"></i>
                                    </el-col>
                                    <el-col :span="18">
                                        <el-tag closable @close="removeRightById(scope.row,item3.id)" type="warning" v-for="(item3, i3) in item2.children" :key="i3">{{item3.authName}}</el-tag>
                                    </el-col>
                                </el-row>
                            </el-col>
                        </el-row>
                       <!-- <pre>{{scope.row}}</pre> -->
                    </template>
                </el-table-column>
                <el-table-column type="index"></el-table-column>
                <el-table-column label="角色名称" prop="roleName"></el-table-column>
                <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
                <el-table-column label="操作" width="300px">
                    <template slot-scope="scope">
                        <el-button type="primary" icon="el-icon-edit" size="mini">编辑</el-button>
                        <el-button type="danger" icon="el-icon-delete" size="mini">删除</el-button>
                        <el-button type="warning" icon="el-icon-setting" size="mini" @click="showSetRightDialog(scope.row)">分配权限</el-button>
                    </template>
                </el-table-column>
            </el-table>
        </el-card>
        <!-- 分配权限的对话框 -->
        <el-dialog title="分配权限" :visible.sync="setRightDialogVisible" @close="setRightDialogClosed" width="50%" >
            <!-- 树形控件 -->
            <el-tree show-checkbox default-expand-all :default-checked-keys="defKeys" ref="treeRef" node-key="id" :data="rightlist" :props="treeProps" ></el-tree>
            <span slot="footer" class="dialog-footer">
                <el-button @click="setRightDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="allotRights">确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>
<script>
export default {
    data() {
        return {
            // 角色列表
            roleList:[],
            // 分配权限对话框显示
            setRightDialogVisible:false,
            // 所有权限的数据
            rightlist:[],
            // 树形控件属性绑定对象
            treeProps: {
                children: 'children',
                label: 'authName'
            },
            // 默认选中的id值数组
            defKeys:[],
            // 当前即将分配权限的角色的id
            roleId:''
        }
    },
    created() {
        // 获取所有的角色
        this.getRolesList()
    },
    methods: {
        async getRolesList(){
            const {data:res} = await this.$http.get(`roles`)
            if(res.meta.status!==200) return this.$message.error('获取数据失败')
            this.roleList = res.data
            // console.log(this.roleList)
        },
        // 根据id删除对应的权限
        async removeRightById(role,rightid){
            const confirminfo = await this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).catch(err => err)
            if(confirminfo !== 'confirm'){
                return this.$message.info('已取消')
            }
            const {data:res} = await this.$http.delete(`roles/${role.id}/rights/${rightid}`)
            if(res.meta.status!==200) return this.$message.error('删除权限失败')
            role.children = res.data
        },
        //展示分配权限对话框
        async showSetRightDialog(role){
            this.roleId = role.id
            const {data:res} = await this.$http.get(`rights/tree`)
            if(res.meta.status!==200) return this.$message.error('获取权限失败')
            this.rightlist = res.data
            // 递归获取三级节点id
            this.getLeafKeys(role,this.defKeys)

            this.setRightDialogVisible = true
        },
        // 递归获取三级权限id
        getLeafKeys(items,arr){
            if(!items.children){
                return arr.push(items.id)
            }
            items.children.forEach(item => {
                this.getLeafKeys(item,arr)
            });
        },
        // 关闭对框框
        setRightDialogClosed(){
            this.defKeys = []
        },
        //点击为角色分配权限
        async allotRights(){
            const keys = [
                ...this.$refs.treeRef.getCheckedKeys(),
                ...this.$refs.treeRef.getHalfCheckedKeys(),
            ]
            const idStr = keys.join(',')
            const {data:res} = await this.$http.post(`roles/${this.roleId}/rights`,{rids:idStr})
            if(res.meta.status!==200) return this.$message.error('分配权限失败')
            this.$message.success('分配权限成功')
            this.getRolesList()
            this.setRightDialogVisible = false
        }
    },
}
</script>
<style lang="less" scoped>
    .el-tag{
        margin: 7px;
    }
    .bdtop{
        border-top: 1px solid #eee;
    }
    .bdbottom{
        border-bottom:1px solid #eee;
    }
    .vcenter{
        display: flex;
        align-items: center;
    }
</style>