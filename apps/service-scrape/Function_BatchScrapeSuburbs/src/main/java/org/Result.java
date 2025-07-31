package org;

public class Result<T> {
    public final boolean ok;
    public final T val;
    public final Exception err;

    private Result(T val) {
        ok = true;
        this.val = val;
        err = null;
    }

    private Result(Exception err) {
        ok = false;
        val = null;
        this.err = err;
    }

    public static <T> Result<T> ok(T val) {
        return new Result<>(val);
    }

    public static <T> Result<T> fail(Exception err) {
        return new Result<>(err);
    }
}
