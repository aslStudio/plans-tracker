import AppKit
import Foundation

private enum Palette {
    case light, dark, tinted, foreground, splashLight, splashDark

    var background: NSColor? {
        switch self {
        case .light: return NSColor(srgbRed: 11 / 255, green: 119 / 255, blue: 115 / 255, alpha: 1)
        case .dark: return NSColor(srgbRed: 15 / 255, green: 39 / 255, blue: 40 / 255, alpha: 1)
        case .tinted: return NSColor(srgbRed: 246 / 255, green: 249 / 255, blue: 248 / 255, alpha: 1)
        case .foreground, .splashLight, .splashDark: return nil
        }
    }

    var mark: NSColor {
        switch self {
        case .tinted: return NSColor(srgbRed: 31 / 255, green: 60 / 255, blue: 58 / 255, alpha: 1)
        case .splashLight: return NSColor(srgbRed: 11 / 255, green: 119 / 255, blue: 115 / 255, alpha: 1)
        case .splashDark: return NSColor(srgbRed: 214 / 255, green: 255 / 255, blue: 246 / 255, alpha: 1)
        default: return NSColor(srgbRed: 244 / 255, green: 255 / 255, blue: 251 / 255, alpha: 1)
        }
    }

    var point: NSColor {
        switch self {
        case .tinted: return NSColor(srgbRed: 31 / 255, green: 60 / 255, blue: 58 / 255, alpha: 1)
        case .splashLight: return NSColor(srgbRed: 62 / 255, green: 178 / 255, blue: 160 / 255, alpha: 1)
        case .splashDark: return NSColor(srgbRed: 99 / 255, green: 216 / 255, blue: 193 / 255, alpha: 1)
        case .foreground: return NSColor(srgbRed: 244 / 255, green: 255 / 255, blue: 251 / 255, alpha: 1)
        default: return NSColor(srgbRed: 151 / 255, green: 239 / 255, blue: 218 / 255, alpha: 1)
        }
    }
}

private func render(_ palette: Palette, to url: URL) throws {
    let size = 1024
    guard let bitmap = NSBitmapImageRep(
        bitmapDataPlanes: nil,
        pixelsWide: size,
        pixelsHigh: size,
        bitsPerSample: 8,
        samplesPerPixel: 4,
        hasAlpha: true,
        isPlanar: false,
        colorSpaceName: .deviceRGB,
        bytesPerRow: 0,
        bitsPerPixel: 0
    ), let context = NSGraphicsContext(bitmapImageRep: bitmap) else {
        throw NSError(domain: "AppIcon", code: 1)
    }

    NSGraphicsContext.saveGraphicsState()
    NSGraphicsContext.current = context
    context.imageInterpolation = .high

    if let background = palette.background {
        background.setFill()
        NSRect(x: 0, y: 0, width: size, height: size).fill()
    } else {
        NSColor.clear.setFill()
        NSRect(x: 0, y: 0, width: size, height: size).fill()
    }

    let leftPage = NSBezierPath()
    leftPage.move(to: NSPoint(x: 500, y: 730))
    leftPage.curve(to: NSPoint(x: 240, y: 748),
                   controlPoint1: NSPoint(x: 424, y: 754),
                   controlPoint2: NSPoint(x: 302, y: 762))
    leftPage.curve(to: NSPoint(x: 200, y: 707),
                   controlPoint1: NSPoint(x: 214, y: 744),
                   controlPoint2: NSPoint(x: 200, y: 731))
    leftPage.line(to: NSPoint(x: 200, y: 315))
    leftPage.curve(to: NSPoint(x: 240, y: 274),
                   controlPoint1: NSPoint(x: 200, y: 287),
                   controlPoint2: NSPoint(x: 216, y: 272))
    leftPage.curve(to: NSPoint(x: 500, y: 292),
                   controlPoint1: NSPoint(x: 323, y: 270),
                   controlPoint2: NSPoint(x: 426, y: 285))
    leftPage.close()
    palette.mark.setFill()
    leftPage.fill()

    let rightPage = NSBezierPath()
    rightPage.move(to: NSPoint(x: 524, y: 730))
    rightPage.curve(to: NSPoint(x: 784, y: 748),
                    controlPoint1: NSPoint(x: 600, y: 754),
                    controlPoint2: NSPoint(x: 722, y: 762))
    rightPage.curve(to: NSPoint(x: 824, y: 707),
                    controlPoint1: NSPoint(x: 810, y: 744),
                    controlPoint2: NSPoint(x: 824, y: 731))
    rightPage.line(to: NSPoint(x: 824, y: 315))
    rightPage.curve(to: NSPoint(x: 784, y: 274),
                    controlPoint1: NSPoint(x: 824, y: 287),
                    controlPoint2: NSPoint(x: 808, y: 272))
    rightPage.curve(to: NSPoint(x: 524, y: 292),
                    controlPoint1: NSPoint(x: 701, y: 270),
                    controlPoint2: NSPoint(x: 598, y: 285))
    rightPage.close()
    palette.point.setFill()
    rightPage.fill()

    context.flushGraphics()
    NSGraphicsContext.restoreGraphicsState()

    guard let png = bitmap.representation(using: .png, properties: [:]) else {
        throw NSError(domain: "AppIcon", code: 2)
    }
    try png.write(to: url)
}

let destination = URL(fileURLWithPath: CommandLine.arguments[1], isDirectory: true)
try FileManager.default.createDirectory(at: destination, withIntermediateDirectories: true)
try render(.light, to: destination.appendingPathComponent("default.png"))
try render(.dark, to: destination.appendingPathComponent("dark.png"))
try render(.tinted, to: destination.appendingPathComponent("tinted.png"))
try render(.foreground, to: destination.appendingPathComponent("foreground.png"))
try render(.splashLight, to: destination.appendingPathComponent("splash-light.png"))
try render(.splashDark, to: destination.appendingPathComponent("splash-dark.png"))
