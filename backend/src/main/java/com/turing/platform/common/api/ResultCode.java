package com.turing.platform.common.api;

import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * 全局统一返回码。
 * 2xx 成功；4xx 客户端问题；5xx/999 服务端问题。
 */
@Getter
@AllArgsConstructor
public enum ResultCode {

    SUCCESS(200, "操作成功"),
    BAD_REQUEST(400, "请求参数错误"),
    UNAUTHORIZED(401, "未登录或 Token 已失效"),
    FORBIDDEN(403, "没有访问权限"),
    NOT_FOUND(404, "资源不存在"),
    METHOD_NOT_ALLOWED(405, "请求方式不支持"),
    BUSINESS_ERROR(500, "业务处理失败"),
    SYSTEM_ERROR(999, "系统内部异常");

    private final int code;
    private final String message;
}
