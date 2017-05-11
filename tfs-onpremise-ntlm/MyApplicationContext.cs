using System;
using System.Diagnostics;
using TfsOnPremiseNtlm.Properties;
using Swf = System.Windows.Forms;

namespace TfsOnPremiseNtlm
{
    public class MyApplicationContext : Swf.ApplicationContext
    {
        private Swf.NotifyIcon trayIconSwf;
        //private Gtk.StatusIcon trayIcon;

        public MyApplicationContext()
        {
            // Initialize Tray Icon
            //if (Program.IsRunningOnMono())
            //    TrayGtk();
            //else
            TraySwf();
        }

        //private void TrayGtk()
        //{
        //    Gtk.Application.Init();
        //    var mem = new MemoryStream();
        //    Resources.task_manager.Save(mem, ImageFormat.Png);
        //    mem.Seek(0, SeekOrigin.Begin);
        //    // Creation of the Icon
        //    trayIcon = new Gtk.StatusIcon(new Gdk.Pixbuf(mem));
        //    trayIcon.Visible = true;

        //    // Show/Hide the window (even from the Panel/Taskbar) when the TrayIcon has been clicked.
        //    trayIcon.Activate += Open;
        //    // Show a pop up menu when the icon has been right clicked.
        //    trayIcon.PopupMenu += CreateGtkMenu;

        //    // A Tooltip for the Icon
        //    trayIcon.TooltipText = Program.Title;
        //}

        //private void CreateGtkMenu(object o, Gtk.PopupMenuArgs args)
        //{
        //    var popupMenu = new Gtk.Menu();

        //    var menuItemOpen = new Gtk.ImageMenuItem("Open");
        //    menuItemOpen.Image = new Gtk.Image(Gtk.Stock.Open, Gtk.IconSize.Menu);
        //    popupMenu.Add(menuItemOpen);
        //    menuItemOpen.Activated += Open;


        //    var menuItemQuit = new Gtk.ImageMenuItem("Quit");
        //    menuItemQuit.Image = new Gtk.Image(Gtk.Stock.Quit, Gtk.IconSize.Menu);
        //    popupMenu.Add(menuItemQuit);
        //    menuItemQuit.Activated += Exit;

        //    popupMenu.ShowAll();
        //    popupMenu.Popup();
        //}

        private void TraySwf()
        {
            trayIconSwf = new Swf.NotifyIcon()
            {
                Icon = Resources.PerfCenterCpl,
                Text = Program.Title,
                ContextMenu = new Swf.ContextMenu(new Swf.MenuItem[] {
                    new Swf.MenuItem("Open", Open) { DefaultItem = true },
                    new Swf.MenuItem("Exit", Exit)
                }),
                Visible = true
            };
            trayIconSwf.DoubleClick += Open;
            trayIconSwf.Visible = false;
            Swf.Application.DoEvents();
            trayIconSwf.Visible = true;
        }

        void Exit(object sender, EventArgs e)
        {
            // Hide tray icon, otherwise it will remain shown until user mouses over it
            if (trayIconSwf != null)
                trayIconSwf.Visible = false;
            //if (trayIcon != null)
            //    trayIcon.Visible = false;

            if (Program.server != null)
                Program.server.Dispose();
            Swf.Application.Exit();
        }

        void Open(object sender, EventArgs e)
        {
            Process.Start(new ProcessStartInfo()
            {
                FileName = Program.BaseUrl + "/",
                UseShellExecute = true
            });
        }
    }
}
