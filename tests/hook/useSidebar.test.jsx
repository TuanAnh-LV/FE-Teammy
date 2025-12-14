/**
UTC01 N Initial state => Returns collapsed false
- Pre: hook initialized
- Condition: call useSidebar
- Confirmation: collapsed is false initially

UTC02 N Toggle function => Switches collapsed state
- Pre: collapsed is false
- Condition: call toggle
- Confirmation: collapsed becomes true; call again becomes false

UTC03 N Close function => Sets collapsed to true
- Pre: collapsed is false
- Condition: call close
- Confirmation: collapsed becomes true

UTC04 N Open function => Sets collapsed to false
- Pre: collapsed is true
- Condition: call open
- Confirmation: collapsed becomes false

UTC05 B Multiple toggles => State changes correctly
- Pre: initial state
- Condition: toggle multiple times
- Confirmation: alternates between true/false
*/

import { renderHook, act } from "@testing-library/react";
import { useSidebar } from "../../src/hook/useSidebar";

describe("useSidebar Report5", () => {
  test("UTC01 [N] Initial state => Returns collapsed false", () => {
    const { result } = renderHook(() => useSidebar());
    
    expect(result.current.collapsed).toBe(false);
    expect(typeof result.current.toggle).toBe("function");
    expect(typeof result.current.close).toBe("function");
    expect(typeof result.current.open).toBe("function");
  });

  test("UTC02 [N] Toggle function => Switches collapsed state", () => {
    const { result } = renderHook(() => useSidebar());
    
    expect(result.current.collapsed).toBe(false);
    
    act(() => {
      result.current.toggle();
    });
    expect(result.current.collapsed).toBe(true);
    
    act(() => {
      result.current.toggle();
    });
    expect(result.current.collapsed).toBe(false);
  });

  test("UTC03 [N] Close function => Sets collapsed to true", () => {
    const { result } = renderHook(() => useSidebar());
    
    act(() => {
      result.current.close();
    });
    expect(result.current.collapsed).toBe(true);
  });

  test("UTC04 [N] Open function => Sets collapsed to false", () => {
    const { result } = renderHook(() => useSidebar());
    
    // First close it
    act(() => {
      result.current.close();
    });
    expect(result.current.collapsed).toBe(true);
    
    // Then open it
    act(() => {
      result.current.open();
    });
    expect(result.current.collapsed).toBe(false);
  });

  test("UTC05 [B] Multiple toggles => State changes correctly", () => {
    const { result } = renderHook(() => useSidebar());
    
    const initialState = result.current.collapsed;
    
    act(() => {
      result.current.toggle();
      result.current.toggle();
      result.current.toggle();
    });
    
    expect(result.current.collapsed).toBe(!initialState);
  });
});

export const UT_REPORT_5_SUMMARY = {
  functionName: "useSidebar",
  totalTC: 5,
  breakdown: { N: 4, B: 1, A: 0 },
  notes: "Covers initial state, toggle/close/open functions, and multiple state changes.",
};
