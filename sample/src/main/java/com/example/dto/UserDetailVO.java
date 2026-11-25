package com.example.dto;

/**
 * 用户详情
 */
public class UserDetailVO extends BaseAuditVO {

    /** 用户名 */
    private String username;

    /** 档案信息 */
    private Profile profile;

    /** 联系方式 */
    private UserContactRecord contact;

    /**
     * 旧档案(引用类型,验证 allOf 承载 deprecated)
     * @deprecated 请改用 profile 字段
     */
    @Deprecated
    private Profile legacyProfile;

    /** 标签列表 */
    private java.util.List<String> tags;

    /**
     * 档案信息(静态嵌套类,应展开为独立数据模型)
     */
    public static class Profile {

        /** 昵称 */
        private String nickname;

        /** 账号状态 */
        private Status status;
    }
}
